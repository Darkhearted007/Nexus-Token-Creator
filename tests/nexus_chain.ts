import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NexusChain } from "../target/types/nexus_chain";

describe("nexus_chain", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.nexusChain as Program<NexusChain>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
