import { 
  Connection, 
  Keypair, 
  SystemProgram, 
  Transaction, 
  PublicKey,
} from '@solana/web3.js';
import { 
  createInitializeMintInstruction, 
  getMinimumBalanceForRentExemptMint, 
  MINT_SIZE, 
  TOKEN_PROGRAM_ID, 
  createAssociatedTokenAccountInstruction, 
  getAssociatedTokenAddress, 
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType
} from '@solana/spl-token';

// Treasury wallet — corresponds to the admin wallet in backend/.env
const TREASURY_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_TREASURY_WALLET ?? "5hA4DvFa82zJS6yx5ahdb2HEKvmMx4zJeXTyZaWTA5A8"
);
const PROTOCOL_FEE_LAMPORTS = 0.1 * 10 ** 9; // 0.1 SOL Base Fee


// Export so the frontend WalletContextProvider can consume the same RPC
export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

export async function buildMintTransaction(
  connection: Connection,
  walletPubkey: PublicKey,
  decimals: number,
  supply: number,
  volumeBotTierCost: number,
  sniperBotTierCost: number,
  revokeMint: boolean,
  revokeFreeze: boolean,
  revokeUpdate: boolean
): Promise<{ transaction: Transaction, mintPath: string, mintKeypair: Keypair }> {
  const mintKeypair = Keypair.generate();
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  
  const transaction = new Transaction();

  // 1. Protocol Fee Transfer (The Profitability Layer)
  const volumeBotLamports = volumeBotTierCost * 10 ** 9;
  const sniperBotLamports = sniperBotTierCost * 10 ** 9;
  
  const mintFee = revokeMint ? 0.1 * 10 ** 9 : 0;
  const freezeFee = revokeFreeze ? 0.1 * 10 ** 9 : 0;
  const updateFee = revokeUpdate ? 0.1 * 10 ** 9 : 0;

  const totalFee = PROTOCOL_FEE_LAMPORTS + volumeBotLamports + sniperBotLamports + mintFee + freezeFee + updateFee;

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: walletPubkey,
      toPubkey: TREASURY_WALLET,
      lamports: totalFee,
    })
  );

  // 2. Create Mint Account on-chain
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: walletPubkey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mintKeypair.publicKey, // mint address
      decimals,              // decimals
      walletPubkey,          // mint authority
      walletPubkey,          // freeze authority
      TOKEN_PROGRAM_ID
    )
  );

  // 3. Create Associated Token Account for the User
  const userATA = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    walletPubkey,
    false,
    TOKEN_PROGRAM_ID
  );
  
  transaction.add(
    createAssociatedTokenAccountInstruction(
      walletPubkey,          // payer
      userATA,               // new ata
      walletPubkey,          // owner
      mintKeypair.publicKey, // mint
      TOKEN_PROGRAM_ID
    )
  );

  // 4. Mint Total Supply to User's ATA
  const rawSupply = BigInt(supply) * (10n ** BigInt(decimals));
  
  transaction.add(
    createMintToInstruction(
      mintKeypair.publicKey,
      userATA,
      walletPubkey,
      rawSupply, // supply in fundamental units
      [],
      TOKEN_PROGRAM_ID
    )
  );

  // 5. Authority Revocations (Smithii features)
  if (revokeMint) {
    transaction.add(
      createSetAuthorityInstruction(
        mintKeypair.publicKey,
        walletPubkey,
        AuthorityType.MintTokens,
        null,
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  if (revokeFreeze) {
    transaction.add(
      createSetAuthorityInstruction(
        mintKeypair.publicKey,
        walletPubkey,
        AuthorityType.FreezeAccount,
        null,
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  transaction.feePayer = walletPubkey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;

  // The Mint account being created must partially sign the transaction
  transaction.partialSign(mintKeypair);

  return { transaction, mintPath: mintKeypair.publicKey.toBase58(), mintKeypair };
}
