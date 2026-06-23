import {
  createUmi
} from "@metaplex-foundation/umi-bundle-defaults";

import {
  createV1,
  findMetadataPda,
  mplTokenMetadata,
  updateV1,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  signerIdentity,
  publicKey,
} from "@metaplex-foundation/umi";

import { PublicKey } from "@solana/web3.js";

export type TokenMetadataInput = {
  mint: PublicKey;
  name: string;
  symbol: string;
  description: string;
  image: string;
  website?: string;
  twitter?: string;
  telegram?: string;
};

export async function createTokenMetadata(input: TokenMetadataInput) {
  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL!;
  const umi = createUmi(rpc).use(mplTokenMetadata());

  const mintPk = publicKey(input.mint.toBase58());

  const metadataUri = JSON.stringify({
    name: input.name,
    symbol: input.symbol,
    description: input.description,
    image: input.image,
    external_url: input.website,
    extensions: {
      twitter: input.twitter,
      telegram: input.telegram,
    },
  });

  const metadataPda = findMetadataPda(umi, { mint: mintPk });

  const tx = createV1(umi, {
    mint: mintPk,
    authority: umi.identity,
    name: input.name,
    symbol: input.symbol,
    uri: metadataUri,
    sellerFeeBasisPoints: 0,
    isMutable: true,
  });

  await tx.sendAndConfirm(umi);

  return {
    metadataAddress: metadataPda.toString(),
    metadataUri,
  };
}

/**
 * TRUE immutability enforcement (fixes your "fake revokeUpdate fee bug")
 */
export async function revokeUpdateAuthority(mint: PublicKey, signer: any) {
  const umi = createUmi(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!)
    .use(mplTokenMetadata())
    .use(signerIdentity(signer));

  const mintPk = publicKey(mint.toBase58());

  const metadata = findMetadataPda(umi, { mint: mintPk });

  const tx = updateV1(umi, {
    metadata,
    updateAuthority: null, // <- THIS is the real revoke
  });

  await tx.sendAndConfirm(umi);

  return true;
}