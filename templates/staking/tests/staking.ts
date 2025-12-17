import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaStakingDapp } from "../target/types/solana_staking_dapp";
import { assert } from "chai";
import { createMint } from "@solana/spl-token";

describe("solana-staking-dapp", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaStakingDapp as Program<SolanaStakingDapp>;

  let mint: anchor.web3.PublicKey;
  let pool: anchor.web3.Keypair;

  it("Is initialized!", async () => {
    pool = anchor.web3.Keypair.generate();
    mint = await createMint(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 6);

    await program.methods.initialize(new anchor.BN(10)) // 10 tokens per second
      .accounts({
        pool: pool.publicKey,
        tokenMint: mint,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([pool])
      .rpc();

    const account = await program.account.pool.fetch(pool.publicKey);
    assert.ok(account.rewardRate.eq(new anchor.BN(10)));
  });
});