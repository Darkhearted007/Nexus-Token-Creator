/**
 * @fileoverview Sniper Bot — Bundle Execution Algorithm
 * @copyright 2026 NexusChain. All rights reserved.
 *
 * PROPRIETARY CODE — Unauthorized use or reverse-engineering prohibited.
 *
 * This module implements NexusChain's proprietary sniper bot that executes
 * bundle purchases at block 0 to prevent MEV sandwich attacks. Extracting or
 * reusing this algorithm for competing services constitutes violation of
 * intellectual property rights.
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
import bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6/quote";
const JUPITER_SWAP_API = "https://quote-api.jup.ag/v6/swap";
const SOL_MINT = "So11111111111111111111111111111111111111112";

// How long to wait for a liquidity pool to appear before giving up (ms)
const SNIPE_TIMEOUT_MS = 5 * 60_000;
// How often to poll Jupiter for a valid route (ms)
const ROUTE_POLL_INTERVAL_MS = 2_000;

/**
 * Sniper Bot Runner
 * Polls Jupiter until a route for the target mint becomes available, then
 * executes a buy immediately with high-priority compute fees.
 */
export async function runSniperBot(mintAddress: string, tierCost: number) {
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");

  console.log(`[Sniper Bot] 🎯 Initiating Sniper for Mint: ${mintAddress}`);
  console.log(`- Tier: ${tierCost} SOL`);

  // Load sub-wallets for distributed sniping
  const walletsRaw = process.env.SNIPER_BOT_PRIVATE_KEYS;
  if (!walletsRaw) {
    throw new Error(
      "SNIPER_BOT_PRIVATE_KEYS is missing in .env — " +
        "provide one or more comma-separated base58 private keys"
    );
  }

  const subWallets = walletsRaw
    .split(",")
    .map((key) => Keypair.fromSecretKey(bs58.decode(key.trim())));

  // Dynamic wallet allocation based on tier
  let activeWalletCount = 1;
  if (tierCost >= 0.3) activeWalletCount = 5;
  if (tierCost >= 0.5) activeWalletCount = 10;

  const walletsToUse = subWallets.slice(0, activeWalletCount);

  console.log(
    `[Sniper Bot] ⚡ Deploying ${walletsToUse.length} sub-wallet(s) for target acquisition...`
  );

  /**
   * Poll Jupiter until a valid route exists for the mint, then execute the
   * swap immediately with elevated priority fees.
   */
  const executeSnipe = async (wallet: Keypair, index: number) => {
    const label = `Sniper Wallet ${index + 1} (${wallet.publicKey
      .toBase58()
      .slice(0, 6)})`;
    try {
      // 1. Check Balance
      const balance = await connection.getBalance(wallet.publicKey);
      const jitoTipLamports = parseInt(
        process.env.JITO_TIP_LAMPORTS ?? "100000"
      );
      const minRequired = 0.02 * LAMPORTS_PER_SOL + jitoTipLamports;
      if (balance < minRequired) {
        console.warn(`[Sniper Bot] ⚠️ ${label} has insufficient funds.`);
        return;
      }

      // 2. Poll Jupiter until a route appears (liquidity pool not yet live)
      const buyAmountLamports = Math.floor(0.01 * LAMPORTS_PER_SOL);
      const deadline = Date.now() + SNIPE_TIMEOUT_MS;
      let quote: Record<string, unknown> | null = null;

      console.log(`[Sniper Bot] 🔍 ${label} — waiting for Jupiter route...`);

      while (Date.now() < deadline) {
        const quoteParams = new URLSearchParams({
          inputMint: SOL_MINT,
          outputMint: mintAddress,
          amount: buyAmountLamports.toString(),
          slippageBps: "300", // 3 % to account for thin liquidity at launch
        });

        try {
          const quoteResp = await fetch(
            `${JUPITER_QUOTE_API}?${quoteParams}`
          );
          if (quoteResp.ok) {
            const body = await quoteResp.json();
            if (!body.error && body.routePlan) {
              quote = body;
              break;
            }
          }
        } catch {
          // Network hiccup — retry
        }

        await new Promise((r) => setTimeout(r, ROUTE_POLL_INTERVAL_MS));
      }

      if (!quote) {
        console.warn(
          `[Sniper Bot] ⏰ ${label} — no route found within timeout. Aborting.`
        );
        return;
      }

      console.log(`[Sniper Bot] ✅ ${label} — route found! Executing snipe.`);

      // 3. Get the serialised swap transaction from Jupiter with high priority
      const swapResp = await fetch(JUPITER_SWAP_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: wallet.publicKey.toBase58(),
          wrapAndUnwrapSol: true,
          // Use aggressive priority to land the tx quickly
          computeUnitPriceMicroLamports: 200_000,
          // Include a Jito tip as a dedicated transfer instruction
          jitoTipLamports,
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

      // 4. Deserialise → sign → send
      const txBuffer = Buffer.from(swapData.swapTransaction, "base64");
      const tx = VersionedTransaction.deserialize(txBuffer);
      tx.sign([wallet]);

      const signature = await connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });

      console.log(`[Sniper Bot] 🚀 ${label} — snipe sent: ${signature}`);
      await connection.confirmTransaction(signature, "confirmed");
      console.log(`[Sniper Bot] ✅ ${label} — snipe confirmed: ${signature}`);
    } catch (err) {
      console.error(`[Sniper Bot] ❌ ${label} failed:`, err);
    }
  };

  // Execute sniping sequence across all assigned wallets
  const tokenMintPk = new PublicKey(mintAddress); // validate address early
  void tokenMintPk; // used for validation side-effect
  await Promise.all(walletsToUse.map((w, i) => executeSnipe(w, i)));

  console.log(
    `[Sniper Bot] 🛡️ Snipe sequence complete for ${mintAddress}.`
  );
}
