import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import fs from "fs";
import path from "path";

async function main() {
  // Generate Master Admin / Fee Wallet
  const adminWallet = Keypair.generate();
  const adminPrivKey = bs58.encode(adminWallet.secretKey);

  // Output paths — override via environment variables for portability
  const desktopFile =
    process.env.WALLET_OUTPUT_FILE ||
    path.resolve(process.cwd(), "nexus_wallets.txt");
  const envFile =
    process.env.ENV_FILE || path.resolve(process.cwd(), ".env");

  const desktopContent =
    `=== Nexus Chain Master Admin & Fee Wallet ===\n` +
    `Public Key (Address): ${adminWallet.publicKey.toBase58()}\n` +
    `Private Key (bs58):  ${adminPrivKey}\n\n` +
    `IMPORTANT: The Config PDA and Vault PDA do NOT have private keys. \n` +
    `In Solana, PDAs (Program Derived Addresses) are mathematically derived from the Program ID. \n` +
    `The smart contract acts as the "private key" and signs for the PDA Vault automatically, so no private key exists for them to save!\n`;

  fs.writeFileSync(desktopFile, desktopContent);
  console.log(`Wallet info written to: ${desktopFile}`);

  let envContent = "";
  if (fs.existsSync(envFile)) {
    envContent = fs.readFileSync(envFile, "utf8");
  }

  envContent += `\nADMIN_PRIVATE_KEY=${adminPrivKey}\n`;
  envContent += `FEE_WALLET_ADDRESS=${adminWallet.publicKey.toBase58()}\n`;

  fs.writeFileSync(envFile, envContent);
  console.log(`Env vars appended to: ${envFile}`);
  console.log("Wallets exported successfully!");
}

main().catch(console.error);

