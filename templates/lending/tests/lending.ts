import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaLendingDapp } from "../target/types/solana_lending_dapp";
import { assert } from "chai";
import { createMint } from "@solana/spl-token";

describe("solana-lending-dapp", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaLendingDapp as Program<SolanaLendingDapp>;

  let mint: anchor.web3.PublicKey;
  let market: anchor.web3.Keypair;

  it("Is initialized!", async () => {
    market = anchor.web3.Keypair.generate();
    mint = await createMint(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 6);

    await program.methods.initialize(500) // 5% interest
      .accounts({
        market: market.publicKey,
        tokenMint: mint,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([market])
      .rpc();

    const account = await program.account.market.fetch(market.publicKey);
    assert.equal(account.interestRate, 500);
  });
});