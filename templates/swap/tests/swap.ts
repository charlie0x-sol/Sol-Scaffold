import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { <%= programNamePascalCase %> } from "../target/types/<%= programNameSnakeCase %>";
import { assert } from "chai";
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  createAccount, 
  mintTo, 
  getAccount 
} from "@solana/spl-token";

describe("<%= programName %>", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.<%= programNamePascalCase %> as Program<<%= programNamePascalCase %>>;


  let mintA: anchor.web3.PublicKey;
  let mintB: anchor.web3.PublicKey;
  let swapInfo: anchor.web3.Keypair;
  let vaultA: anchor.web3.PublicKey;
  let vaultB: anchor.web3.PublicKey;
  let authA: anchor.web3.PublicKey;
  let authB: anchor.web3.PublicKey;

  it("Is initialized!", async () => {
    swapInfo = anchor.web3.Keypair.generate();
    
    // Create Mints
    mintA = await createMint(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 6);
    mintB = await createMint(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 6);

    // Create Vaults (ATAs for the SwapInfo account is implied, but here we just use random keypairs for simplicity if the contract allows, or proper ATAs)
    // The contract uses `token::TokenAccount`, not checking ownership strictly in initialize, but we need to pass them.
    // Wait, the contract `initialize` takes `swap_info` as init.
    // And `token_a`, `token_b` are Mints.
    
    await program.methods.initialize(100) // 1% fee
      .accounts({
        swapInfo: swapInfo.publicKey,
        tokenA: mintA,
        tokenB: mintB,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([swapInfo])
      .rpc();
      
    const account = await program.account.swapInfo.fetch(swapInfo.publicKey);
    assert.equal(account.fee, 100);
  });
});