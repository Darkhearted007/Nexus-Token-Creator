import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

// The Program ID specified in programs/nexus_chain/src/lib.rs
const PROGRAM_ID = new PublicKey("5hA4DvFa82zJS6yx5ahdb2HEKvmMx4zJeXTyZaWTA5A8");

async function withdrawFees(amountLamports: number) {
    const connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
    
    // The admin wallet that holds the authority to withdraw fees
    const adminKey = process.env.ADMIN_PRIVATE_KEY;
    if (!adminKey) {
        console.error("❌ ADMIN_PRIVATE_KEY is missing in .env");
        console.error("Please add ADMIN_PRIVATE_KEY=<your-base58-secret> to your backend/.env");
        return;
    }
    const adminWallet = Keypair.fromSecretKey(bs58.decode(adminKey));

    // 1. Derive the Config PDA (stores the admin pubkey)
    const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        PROGRAM_ID
    );

    // 2. Derive the Vault PDA (where the collected SOL fees are stored securely)
    const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault")],
        PROGRAM_ID
    );

    console.log(`[Admin] Preparing to withdraw ${amountLamports} lamports from Vault to Admin`);
    console.log(`- Admin Wallet: ${adminWallet.publicKey.toBase58()}`);
    console.log(`- Config PDA:   ${configPda.toBase58()}`);
    console.log(`- Vault PDA:    ${vaultPda.toBase58()}`);

    // In a fully built Anchor DApp, you typically use the Anchor Provider / Program wrapper 
    // to execute this safely and cleanly:
    /*
        const tx = await program.methods
            .withdrawFees(new anchor.BN(amountLamports))
            .accounts({
                config: configPda,
                vault: vaultPda,
                admin: adminWallet.publicKey,
            })
            .signers([adminWallet])
            .rpc();
    */

    console.log(`[Admin] This script demonstrates the required addresses.`);
    console.log(`[Admin] Next Step: Once the smart contract is deployed, use this logic to pull your fees!`);
}

// Example usage: withdraw 1 SOL (1,000,000,000 lamports)
withdrawFees(1_000_000_000).catch(console.error);
