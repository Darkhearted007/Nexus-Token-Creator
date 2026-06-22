import {
  PublicKey,
  Transaction,
  Connection,
  SystemProgram,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";

export interface AirdropRecipient {
  address: PublicKey;
  amount: number;
}

/**
 * Robustly parses a raw string (from CSV, TXT, or manual entry) into a list of recipients.
 * Format: "Address, Amount" or "Address Amount" or "Address;Amount"
 */
export function parseAirdropFile(rawContent: string): AirdropRecipient[] {
  const lines = rawContent
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  const recipients: AirdropRecipient[] = [];

  for (const line of lines) {
    // Match Solana address followed by a numeric amount
    // Delimiters: comma, space, tab, semicolon
    const match = line.match(/([1-9A-HJ-NP-Za-km-z]{32,44})[ ,;\t]+([\d.]+)/);
    if (match) {
      try {
        recipients.push({
          address: new PublicKey(match[1]),
          amount: parseFloat(match[2]),
        });
      } catch (e) {
        console.warn(`Skipping invalid address in line: ${line}`);
      }
    }
  }

  return recipients;
}

/**
 * Batches airdrop transfers into multiple transactions.
 * Solana limit is around 10-15 instructions per transaction depending on size.
 */
export async function buildAirdropBatches(
  connection: Connection,
  sender: PublicKey,
  tokenMint: PublicKey,
  recipients: AirdropRecipient[],
  decimals: number
): Promise<Transaction[]> {
  const transactions: Transaction[] = [];
  const INSTRUCTIONS_PER_TX = 7; // Small to avoid size limits (ATA + Transfer = 2 per recipient)

  // 1. Get sender's token account
  const senderTokenAccount = await getAssociatedTokenAddress(tokenMint, sender);

  for (let i = 0; i < recipients.length; i += INSTRUCTIONS_PER_TX) {
    const batch = recipients.slice(i, i + INSTRUCTIONS_PER_TX);
    const tx = new Transaction();

    for (const recipient of batch) {
      const recipientAta = await getAssociatedTokenAddress(
        tokenMint,
        recipient.address
      );

      // Check if recipient ATA exists
      let ataExists = true;
      try {
        await getAccount(connection, recipientAta);
      } catch (error) {
        if (
          error instanceof TokenAccountNotFoundError ||
          error instanceof TokenInvalidAccountOwnerError
        ) {
          ataExists = false;
        } else {
          throw error;
        }
      }

      if (!ataExists) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            sender,
            recipientAta,
            recipient.address,
            tokenMint
          )
        );
      }

      const amountInBase = Math.floor(
        recipient.amount * Math.pow(10, decimals)
      );
      tx.add(
        createTransferInstruction(
          senderTokenAccount,
          recipientAta,
          sender,
          BigInt(amountInBase)
        )
      );
    }

    tx.feePayer = sender;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transactions.push(tx);
  }

  return transactions;
}
