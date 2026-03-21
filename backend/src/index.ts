import * as admin from 'firebase-admin';
import { runVolumeBot } from './bots/volume';
import { runSniperBot } from './bots/sniper';
import dotenv from 'dotenv';
dotenv.config();

if (!admin.apps.length) {
    // Note: When running a backend listener outside GCP, you must use a service account key
    console.warn("Initializing Firebase Admin. Ensure GOOGLE_APPLICATION_CREDENTIALS environment variable points to your service account key.");
    try {
      admin.initializeApp({
         projectId: process.env.FIREBASE_PROJECT_ID || 'demo-nexus-chain'
      });
    } catch(err) {
      console.warn("Could not load native Firebase Admin config. Booting without active DB connection. Mock only.");
    }
}

console.log("==========================================");
console.log(" Nexus Launchpad Execution ServerSTARTED ");
console.log("==========================================");
console.log("Listening for new Tokens on Web2 Database...");

const db = admin.firestore();

// Continously listen to the "tokens" collection
const unsubscribe = db.collection('tokens').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            const data = change.doc.data();
            console.log(`\n🔔 New Token Launch Detected: ${data.name} (${data.symbol})`);
            
            // Check for Volume Bot feature
            if (data.volumeBotTier && data.volumeBotTier > 0) {
                console.log(`⚡ Analyzing Volume Bot Purchase... (Total Tier Cost: ${data.volumeBotTier} SOL)`);
                let hours = 1;
                if (data.volumeBotTier >= 0.3) hours = 6;
                if (data.volumeBotTier >= 0.5) hours = 24;
                
                // Execute completely asynchronously
                runVolumeBot(data.mintAddress, hours).catch(err => console.error("Volume Bot Crash:", err));
            }

            // Check for Sniper Bot Feature
            if (data.sniperBotTier && data.sniperBotTier > 0) {
                console.log(`🎯 Evaluating Sniper Bot Bundling... (Total Tier Cost: ${data.sniperBotTier} SOL)`);
                // Execute asynchronously
                runSniperBot(data.mintAddress, data.sniperBotTier).catch(err => console.error("Sniper Bot Crash:", err));
            }
        }
    });
}, err => {
    console.error("Firestore Listener Status:", err.message);
});
