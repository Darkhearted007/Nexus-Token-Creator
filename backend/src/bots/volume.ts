/**
 * @fileoverview Volume Bot — Market Making Algorithm
 * @copyright 2026 NexusChain. All rights reserved.
 *
 * PROPRIETARY CODE — Unauthorized use or reverse-engineering prohibited.
 *
 * This module implements NexusChain's proprietary volume bot that simulates
 * organic trading activity. Extracting or reusing this algorithm for competing
 * services constitutes violation of intellectual property rights.
 *
 * For inquiries: legal@nexuschain.dev
 */

import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import bs58 from "bs58";
import dotenv from "dotenv";
import { logger } from "../logger";

dotenv.config();

const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6/quote";
const JUPITER_SWAP_API = "https://quote-api.jup.ag/v6/swap";
const SOL_MINT = "So11111111111111111111111111111111111111112";

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 10_000;

/** Active sessions keyed by mint address to prevent duplicate concurrent runs. */
const activeSessions = new Map<string, { cancelled: boolean }>();

async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  retries = MAX_RETRIES,
  delayMs = BASE_RETRY_DELAY_MS
): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isLast = attempt === retries;
      logger.warn(`[${label}] Attempt ${attempt}/${retries} failed.`, err);
      if (isLast) {
        logger.error(`[${label}] All retries exhausted.`, err);
        return null;
      }
      const backoff = delayMs * Math.pow(2, attempt - 1);
      logger.info(`[${label}] Retrying in ${Math.round(backoff / 1000)}s...`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
  return null;
}

export async function runVolumeBot(
  mintAddress: string,
  durationHours: number,
  signal: { cancelled: boolean } = { cancelled: false }
) {
  if (activeSessions.has(mintAddress)) {
    logger.warn(
      `[Volume Bot] Session already active for ${mintAddress}, skipping duplicate.`
    );
    return;
  }

  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");

  const botSecretKey = process.env.VOLUME_BOT_PRIVATE_KEY;
  if (!botSecretKey) {
    throw new Error("VOLUME_BOT_PRIVATE_KEY is missing in .env");
  }

  const botKeypair = Keypair.fromSecretKey(bs58.decode(botSecretKey));
  const tokenMint = new PublicKey(mintAddress);

  logger.info(`[Volume Bot] Starting Market Maker session`, {
    token: mintAddress,
    wallet: botKeypair.publicKey.toBase58(),
    durationHours,
  });

  activeSessions.set(mintAddress, signal);
  const endTime = Date.now() + durationHours * 60 * 60 * 1000;

  try {
    while (Date.now() <= endTime && !signal.cancelled) {
      await withRetry(async () => {
        // 1. Balance Check
        const balance = await connection.getBalance(botKeypair.publicKey);
        if (balance < 0.05 * LAMPORTS_PER_SOL) {
          logger.warn(
            `[Volume Bot] Low SOL balance (${(
              balance / LAMPORTS_PER_SOL
            ).toFixed(4)} SOL). Skipping tick.`
          );
          return;
        }

        // 2. Randomise Action (Buy vs Sell) with weighted buy bias on low holdings
        const action = Math.random() > 0.45 ? "BUY" : "SELL";
        logger.info(`[Volume Bot] Action: ${action}`);

        const solPerBuy = parseFloat(
          process.env.VOLUME_BOT_SOL_PER_BUY ?? "0.05"
        );

        let inputMint: string;
        let outputMint: string;
        let swapAmount: number;

        if (action === "BUY") {
          inputMint = SOL_MINT;
          outputMint = tokenMint.toBase58();
          swapAmount = Math.floor(solPerBuy * LAMPORTS_PER_SOL);
        } else {
          // Check bot's token holdings before attempting a sell
          const tokenAccount = await getAssociatedTokenAddress(
            tokenMint,
            botKeypair.publicKey
          );
          try {
            const accountInfo = await getAccount(connection, tokenAccount);
            if (accountInfo.amount === 0n) {
              logger.info(
                "[Volume Bot] No tokens to sell — converting to BUY tick."
              );
              inputMint = SOL_MINT;
              outputMint = tokenMint.toBase58();
              swapAmount = Math.floor(solPerBuy * LAMPORTS_PER_SOL);
            } else {
              // Sell roughly half the held balance; ensure at least 1 raw token
              const half = accountInfo.amount / 2n;
              swapAmount = Number(half > 0n ? half : 1n);
              inputMint = tokenMint.toBase58();
              outputMint = SOL_MINT;
            }
          } catch {
            // Token account not yet initialised — buy instead
            logger.info(
              "[Volume Bot] Token account not found — converting to BUY tick."
            );
            inputMint = SOL_MINT;
            outputMint = tokenMint.toBase58();
            swapAmount = Math.floor(solPerBuy * LAMPORTS_PER_SOL);
          }
        }

        // 3. Get a swap quote from Jupiter v6
        const quoteParams = new URLSearchParams({
          inputMint,
          outputMint,
          amount: swapAmount.toString(),
          slippageBps: "100", // 1 % slippage
        });

        const quoteResp = await fetch(`${JUPITER_QUOTE_API}?${quoteParams}`);
        if (!quoteResp.ok) {
          throw new Error(
            `Jupiter quote HTTP ${quoteResp.status}: ${await quoteResp.text()}`
          );
        }
        const quote = await quoteResp.json();
        if (quote.error) {
          throw new Error(`Jupiter quote error: ${quote.error}`);
        }

        // 4. Fetch the serialised swap transaction from Jupiter
        const swapResp = await fetch(JUPITER_SWAP_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteResponse: quote,
            userPublicKey: botKeypair.publicKey.toBase58(),
            wrapAndUnwrapSol: true,
            computeUnitPriceMicroLamports: parseInt(
              process.env.COMPUTE_UNIT_PRICE_MICRO_LAMPORTS ?? "50000"
            ),
          }),
        });
        if (!swapResp.ok) {
          throw new Error(
            `Jupiter swap HTTP ${swapResp.status}: ${await swapResp.text()}`
          );
        }
        const swapData = await swapResp.json();
        if (swapData.error) {
          throw new Error(`Jupiter swap error: ${swapData.error}`);
        }

        // 5. Deserialise → sign → send
        const txBuffer = Buffer.from(swapData.swapTransaction, "base64");
        const tx = VersionedTransaction.deserialize(txBuffer);
        tx.sign([botKeypair]);

        const signature = await connection.sendRawTransaction(tx.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
        });

        logger.info(`[Volume Bot] Swap sent: ${signature}`);
        await connection.confirmTransaction(signature, "confirmed");
        logger.info(`[Volume Bot] Swap confirmed: ${signature}`);
      }, "Volume Bot Tick");

      if (signal.cancelled) break;

      // Randomised delay for organic-looking pattern
      const nextTickDelay =
        Math.floor(Math.random() * (120_000 - 30_000 + 1)) + 30_000; // 30s–2m
      logger.info(
        `[Volume Bot] Sleeping for ${Math.round(nextTickDelay / 1000)}s...`
      );
      await new Promise<void>((resolve) => setTimeout(resolve, nextTickDelay));
    }

    logger.info(
      `[Volume Bot] Session ${
        signal.cancelled ? "stopped" : "completed"
      } for ${mintAddress}`
    );
  } finally {
    activeSessions.delete(mintAddress);
  }
}
