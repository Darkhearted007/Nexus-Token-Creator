const { Keypair } = require("@solana/web3.js");
const fs = require("fs");

async function main() {
  // Dynamically load bs58 in case it's packaged weirdly in CJS
  let bs58;
  try {
    bs58 = require("bs58");
  } catch {
    bs58 = await import("bs58");
  }

  const encodeKey = bs58.encode || (bs58.default && bs58.default.encode);

  const adminWallet = Keypair.generate();
  const adminPrivKey = encodeKey(adminWallet.secretKey);

  const desktopFile = "/home/homepcblockchain/Desktop/nexus_wallets.txt";
  const envFile = "/home/homepcblockchain/nexus_chain/backend/.env";

  const desktopContent =
    `=== Nexus Chain Master Admin & Fee Wallet ===\n` +
    `Public Key (Address): ${adminWallet.publicKey.toBase58()}\n` +
    `Private Key (bs58):  ${adminPrivKey}\n\n` +
    `IMPORTANT: The Config PDA and Vault PDA do NOT have private keys. \n` +
    `In Solana, PDAs (Program Derived Addresses) are mathematically derived from the Program ID. \n` +
    `The smart contract acts as the "private key" and signs for the PDA Vault automatically, so no private key exists for them to save!\n`;

  fs.writeFileSync(desktopFile, desktopContent);

  let envContent = "";
  if (fs.existsSync(envFile)) {
    envContent = fs.readFileSync(envFile, "utf8");
  }

  envContent += `\nADMIN_PRIVATE_KEY=${adminPrivKey}\n`;
  envContent += `FEE_WALLET_ADDRESS=${adminWallet.publicKey.toBase58()}\n`;

  fs.writeFileSync(envFile, envContent);

  console.log("SUCCESS");
}
main().catch(console.error);
