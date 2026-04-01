import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "./config";

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
  try {
    const tokensRef = collection(db, "tokens");
    const docRef = await addDoc(tokensRef, {
      ...data,
      createdAt: serverTimestamp(),
      upvotes: 0,
    });
    console.log("Token metadata saved to Firebase with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Firebase Error - adding document: ", e);
    // Suppress throw on demo key so UI doesn't crash during testing
    if (process.env.NODE_ENV !== "production") {
       return "demo-id-123";
    }
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
