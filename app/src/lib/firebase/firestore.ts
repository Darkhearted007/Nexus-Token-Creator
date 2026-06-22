import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
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

export interface MarketMakerSessionRecord {
  mintAddress: string;
  creatorWallet: string;
  strategy: string;
  duration: number; // hours
  volumeSol: number;
}

export async function saveMarketMakerSession(
  data: MarketMakerSessionRecord
): Promise<string> {
  const sessionsRef = collection(db, "market_maker_sessions");
  try {
    const docRef = await addDoc(sessionsRef, {
      ...data,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    logger.info("Market maker session created", { id: docRef.id });
    return docRef.id;
  } catch (e) {
    logger.error("Firebase Error - creating market maker session", e);
    throw e;
  }
}

export async function stopMarketMakerSession(sessionId: string): Promise<void> {
  const sessionRef = doc(db, "market_maker_sessions", sessionId);
  try {
    await updateDoc(sessionRef, { status: "stopped" });
    logger.info("Market maker session stopped", { id: sessionId });
  } catch (e) {
    logger.error("Firebase Error - stopping market maker session", e);
    throw e;
  }
}
