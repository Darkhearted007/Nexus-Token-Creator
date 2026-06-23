/**
 * @fileoverview NexusChain Launchpad Backend Server
 * @copyright 2026 NexusChain. All rights reserved.
 * 
 * CONFIDENTIAL — Unauthorized access, modification, or distribution prohibited.
 * 
 * This backend orchestrates bot execution and Firestore synchronization.
 */

import * as admin from 'firebase-admin';
import * as http from 'http';
import { PublicKey } from '@solana/web3.js';
import { runVolumeBot } from './bots/volume';
import { runSniperBot } from './bots/sniper';
import { logger } from './logger';
import { auditLogger } from './auditLogger';
import dotenv from 'dotenv';
dotenv.config();

/** Treasury wallet that receives all protocol fees from token launches. */
const TREASURY_WALLET_ADDRESS = process.env.TREASURY_WALLET ?? '5hA4DvFa82zJS6yx5ahdb2HEKvmMx4zJeXTyZaWTA5A8';

// Validate treasury wallet is a valid Solana address
try {
    new PublicKey(TREASURY_WALLET_ADDRESS);
    logger.info(`Treasury wallet configured: ${TREASURY_WALLET_ADDRESS}`);
} catch (e) {
    throw new Error(`Invalid TREASURY_WALLET address: ${TREASURY_WALLET_ADDRESS}`);
}

/** Minimal HTTP health check server so Docker health checks work. */
function startHealthServer(port = 3001) {
    const server = http.createServer((req, res) => {
        if (req.url === '/health' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', ts: Date.now() }));
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
            'GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. ' +
            'Point it to your service account JSON file.'
        );
    }
    if (!projectId) {
        throw new Error('FIREBASE_PROJECT_ID environment variable is not set.');
    }

    admin.initializeApp({ projectId });

    // Smoke-test the connection
    const db = admin.firestore();
    await db.collection('_healthcheck').limit(1).get();
    logger.info('Firebase Admin initialized and connected', { projectId });
    return db;
}

async function main() {
    logger.info('==========================================');
    logger.info(' Nexus Launchpad Execution Server STARTED ');
    logger.info('==========================================');

    const healthServer = startHealthServer();
    const db = await initFirebase();

    logger.info('Listening for new Tokens on Web2 Database...');

    const unsubscribe = db.collection('tokens').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const data = change.doc.data();
                logger.info(`New Token Launch Detected: ${data.name} (${data.symbol})`);

                if (data.volumeBotTier && data.volumeBotTier > 0) {
                    logger.info(`Volume Bot triggered (tier: ${data.volumeBotTier} SOL)`);
                    let hours = 1;
                    if (data.volumeBotTier >= 0.3) hours = 6;
                    if (data.volumeBotTier >= 0.5) hours = 24;
                    runVolumeBot(data.mintAddress, hours).catch(err =>
                        logger.error('Volume Bot crashed', err)
                    );
                }

                if (data.sniperBotTier && data.sniperBotTier > 0) {
                    logger.info(`Sniper Bot triggered (tier: ${data.sniperBotTier} SOL)`);
                    runSniperBot(data.mintAddress, data.sniperBotTier).catch(err =>
                        logger.error('Sniper Bot crashed', err)
                    );
                }
            }
        });
    }, err => {
        logger.error('Firestore Listener error', err.message);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
        logger.info(`Received ${signal}. Unsubscribing listener and exiting...`);
        unsubscribe();
        healthServer.close();
        process.exit(0);
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch(err => {
    logger.error('Fatal startup error', err);
    process.exit(1);
});
