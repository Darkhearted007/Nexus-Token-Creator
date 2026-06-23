import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "./config";
import { logger } from "../logger";

export interface TokenRecord {
  mintAddress: string;
  creatorWallet: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  hasVolumeBot: boolean;
  // Bot tiers (0 = none)
  volumeBotTier?: number;
  sniperBotTier?: number;
  // Revenue tracking
  totalRevenue?: string | number;
  // Social metadata
  website?: string;
  twitter?: string;
  telegram?: string;
  // Authority revocations
  mintRevoked?: boolean;
  freezeRevoked?: boolean;
  updateRevoked?: boolean;
}

export async function saveTokenToFirestore(data: TokenRecord) {
  const tokensRef = collection(db, "tokens");
  try {
    const docRef = await addDoc(tokensRef, {
      ...data,
      createdAt: serverTimestamp(),
      upvotes: 0,
    });
    logger.info("Token metadata saved to Firebase", { id: docRef.id });
    return docRef.id;
  } catch (e) {
    logger.error("Firebase Error - adding document", e);
    throw e;
  }
}

export async function getTrendingTokens() {
  const tokensRef = collection(db, "tokens");
  // Trending can just be latest for now, or ordered by upvotes
  const q = query(tokensRef, orderBy("createdAt", "desc"), limit(10));
  
  const querySnapshot = await getDocs(q);
  const tokens: Record<string, unknown>[] = [];
  querySnapshot.forEach((doc) => {
    tokens.push({ id: doc.id, ...doc.data() });
  });
  return tokens;
}
