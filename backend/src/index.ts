/**
 * @fileoverview NexusChain Launchpad Backend Server
 * @copyright 2026 NexusChain. All rights reserved.
 *
 * CONFIDENTIAL — Unauthorized access, modification, or distribution prohibited.
 *
 * This backend orchestrates bot execution and Firestore synchronization.
 */

import * as admin from "firebase-admin";
import * as http from "http";
import { PublicKey } from "@solana/web3.js";
import { runVolumeBot } from "./bots/volume";
import { runSniperBot } from "./bots/sniper";
import { logger } from "./logger";
import { auditLogger } from "./auditLogger";
import dotenv from "dotenv";
dotenv.config();

/** Treasury wallet that receives all protocol fees from token launches. */
const TREASURY_WALLET_ADDRESS =
  process.env.TREASURY_WALLET ?? "5hA4DvFa82zJS6yx5ahdb2HEKvmMx4zJeXTyZaWTA5A8";

// Validate treasury wallet is a valid Solana address
try {
  new PublicKey(TREASURY_WALLET_ADDRESS);
  logger.info(`Treasury wallet configured: ${TREASURY_WALLET_ADDRESS}`);
} catch (e) {
  throw new Error(
    `Invalid TREASURY_WALLET address: ${TREASURY_WALLET_ADDRESS}`
  );
}

/** Minimal HTTP health check server so Docker health checks work. */
function startHealthServer(port = 3001) {
  const server = http.createServer((req, res) => {
    if (req.url === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", ts: Date.now() }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  server.listen(port, () => logger.info(`Health server listening on :${port}`));
  return server;
}

async function initFirebase() {
  if (admin.apps.length) return admin.firestore();

  const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!credential) {
    throw new Error(
      "GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. " +
        "Point it to your service account JSON file."
    );
  }
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID environment variable is not set.");
  }

  admin.initializeApp({ projectId });

  // Smoke-test the connection
  const db = admin.firestore();
  await db.collection("_healthcheck").limit(1).get();
  logger.info("Firebase Admin initialized and connected", { projectId });
  return db;
}

/** Active market-maker session signals keyed by Firestore session document ID. */
const activeSessionSignals = new Map<string, { cancelled: boolean }>();

async function main() {
  logger.info("==========================================");
  logger.info(" Nexus Launchpad Execution Server STARTED ");
  logger.info("==========================================");

  const healthServer = startHealthServer();
  const db = await initFirebase();

  // Capture server start time BEFORE attaching listeners so that the initial
  // onSnapshot delivery of pre-existing documents is ignored by both listeners.
  const serverStartTime = admin.firestore.Timestamp.now();

  logger.info("Listening for new Token Launches...");

  // ─── Listener 1: token-creator page ─────────────────────────────────────────
  // Only process documents created after this server instance started to avoid
  // re-triggering bots for tokens whose sessions already ran.
  const unsubscribeTokens = db
    .collection("tokens")
    .where("createdAt", ">", serverStartTime)
    .onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            logger.info(
              `New Token Launch Detected: ${data.name} (${data.symbol})`
            );

            if (data.volumeBotTier && data.volumeBotTier > 0) {
              logger.info(
                `Volume Bot triggered (tier: ${data.volumeBotTier} SOL)`
              );
              let hours = 1;
              if (data.volumeBotTier >= 0.3) hours = 6;
              if (data.volumeBotTier >= 0.5) hours = 24;
              runVolumeBot(data.mintAddress, hours)
                .then(() =>
                  auditLogger.logBotExecution(
                    "VOLUME",
                    data.mintAddress,
                    { tier: data.volumeBotTier, hours },
                    true
                  )
                )
                .catch((err) => {
                  logger.error("Volume Bot crashed", err);
                  auditLogger.logBotExecution(
                    "VOLUME",
                    data.mintAddress,
                    { tier: data.volumeBotTier, hours },
                    false,
                    String(err)
                  );
                });
            }

            if (data.sniperBotTier && data.sniperBotTier > 0) {
              logger.info(
                `Sniper Bot triggered (tier: ${data.sniperBotTier} SOL)`
              );
              runSniperBot(data.mintAddress, data.sniperBotTier)
                .then(() =>
                  auditLogger.logBotExecution(
                    "SNIPER",
                    data.mintAddress,
                    { tier: data.sniperBotTier },
                    true
                  )
                )
                .catch((err) => {
                  logger.error("Sniper Bot crashed", err);
                  auditLogger.logBotExecution(
                    "SNIPER",
                    data.mintAddress,
                    { tier: data.sniperBotTier },
                    false,
                    String(err)
                  );
                });
            }
          }
        });
      },
      (err) => {
        logger.error("Firestore tokens listener error", err.message);
      }
    );

  // ─── Listener 2: Market Maker page sessions ──────────────────────────────────
  logger.info("Listening for Market Maker sessions...");

  const unsubscribeSessions = db
    .collection("market_maker_sessions")
    .where("createdAt", ">", serverStartTime)
    .onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const sessionId = change.doc.id;
          const data = change.doc.data();

          if (change.type === "added" && data.status === "pending") {
            logger.info(
              `[Market Maker] New session ${sessionId} for ${data.mintAddress}`
            );

            const signal: { cancelled: boolean } = { cancelled: false };
            activeSessionSignals.set(sessionId, signal);

            // Acknowledge that the backend has picked up the session
            db.collection("market_maker_sessions")
              .doc(sessionId)
              .update({ status: "running" })
              .catch((err) =>
                logger.error(
                  `[Market Maker] Failed to mark session ${sessionId} as running`,
                  err
                )
              );

            const durationHours =
              typeof data.duration === "number" && data.duration > 0
                ? data.duration
                : 1;

            runVolumeBot(data.mintAddress, durationHours, signal)
              .then(() => {
                activeSessionSignals.delete(sessionId);
                if (!signal.cancelled) {
                  // Bot ran to natural completion
                  db.collection("market_maker_sessions")
                    .doc(sessionId)
                    .update({ status: "stopped" })
                    .catch((err) =>
                      logger.error(
                        `[Market Maker] Failed to finalize session ${sessionId}`,
                        err
                      )
                    );
                }
                auditLogger.logBotExecution(
                  "VOLUME",
                  data.mintAddress,
                  { sessionId, durationHours },
                  true
                );
              })
              .catch((err) => {
                logger.error(
                  `[Market Maker] Session ${sessionId} crashed`,
                  err
                );
                activeSessionSignals.delete(sessionId);
                db.collection("market_maker_sessions")
                  .doc(sessionId)
                  .update({ status: "failed" })
                  .catch(() => {});
                auditLogger.logBotExecution(
                  "VOLUME",
                  data.mintAddress,
                  { sessionId, durationHours },
                  false,
                  String(err)
                );
              });
          }

          // User or admin requested a stop
          if (change.type === "modified" && data.status === "stopped") {
            const signal = activeSessionSignals.get(sessionId);
            if (signal) {
              logger.info(
                `[Market Maker] Session ${sessionId} stop requested — cancelling bot`
              );
              signal.cancelled = true;
              activeSessionSignals.delete(sessionId);
            }
          }
        });
      },
      (err) => {
        logger.error(
          "Firestore market_maker_sessions listener error",
          err.message
        );
      }
    );

  // Graceful shutdown
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Cancelling active sessions and exiting...`);
    // Signal all running volume bots to stop
    for (const sig of activeSessionSignals.values()) {
      sig.cancelled = true;
    }
    activeSessionSignals.clear();
    unsubscribeTokens();
    unsubscribeSessions();
    healthServer.close();
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.error("Fatal startup error", err);
  process.exit(1);
});
