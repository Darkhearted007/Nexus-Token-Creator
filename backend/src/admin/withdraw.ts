import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";
import * as fs from "fs";
import path from "path";

dotenv.config();

// Load the IDL to interact with the program
const IDL_PATH = path.resolve(__dirname, "../../../target/idl/nexus_chain.json");
const IDL = JSON.parse(fs.readFileSync(IDL_PATH, "utf8"));

const PROGRAM_ID = new PublicKey("5hA4DvFa82zJS6yx5ahdb2HEKvmMx4zJeXTyZaWTA5A8");

async function withdrawFees(amountLamports: number) {
    const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");
    
    const adminKey = process.env.ADMIN_PRIVATE_KEY;
    if (!adminKey) {
        console.error("❌ ADMIN_PRIVATE_KEY is missing in .env");
        return;
    }

    const adminWallet = Keypair.fromSecretKey(bs58.decode(adminKey));
    const wallet = new anchor.Wallet(adminWallet);
    const provider = new anchor.AnchorProvider(connection, wallet, {
        preflightCommitment: "confirmed",
    });

    const program = new anchor.Program(IDL as anchor.Idl, provider);

    // 1. Derive PDAs
    const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        PROGRAM_ID
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault")],
        PROGRAM_ID
    );

    console.log(`🚀 Initiating withdrawal of ${amountLamports / 1e9} SOL...`);
    console.log(`- Admin: ${adminWallet.publicKey.toBase58()}`);
    console.log(`- Vault: ${vaultPda.toBase58()}`);

    try {
        const tx = await program.methods
            .withdrawFees(new anchor.BN(amountLamports))
            .accounts({
                config: configPda,
                vault: vaultPda,
                admin: adminWallet.publicKey,
            })
            .signers([adminWallet])
            .rpc();

        console.log(`✅ Success! Transaction Signature: ${tx}`);
    } catch (err) {
        console.error("❌ Withdrawal failed:");
        console.error(err);
    }
}

// Example: Withdraw 0.1 SOL
withdrawFees(100_000_000).catch(console.error);
