import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { <%= programNameSnakeCase.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') %> } from "../target/types/<%= programNameSnakeCase %>";
import { expect } from "chai";
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  TOKEN_PROGRAM_ID 
} from "@solana/spl-token";

describe("governance", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.<%= programNameSnakeCase.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') %> as Program<<%= programNameSnakeCase.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') %>>;

  let daoAccount = anchor.web3.Keypair.generate();
  let mint: anchor.web3.PublicKey;
  let voterTokenAccount: anchor.web3.PublicKey;

  it("Initializes DAO", async () => {
    mint = await createMint(
      provider.connection,
      (provider.wallet as any).payer,
      provider.wallet.publicKey,
      null,
      9
    );

    const name = "My DAO";
    const minTokens = new anchor.BN(100);
    const votingPeriod = new anchor.BN(2); // Short voting period for testing
    const quorum = new anchor.BN(50);

    await program.methods
      .initializeDao(name, minTokens, votingPeriod, quorum)
      .accounts({
        dao: daoAccount.publicKey,
        tokenMint: mint,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([daoAccount])
      .rpc();

    // Fund the DAO treasury
    const airdropSig = await provider.connection.requestAirdrop(daoAccount.publicKey, 1000000000); // 1 SOL
    await provider.connection.confirmTransaction(airdropSig);

    const dao = await program.account.dao.fetch(daoAccount.publicKey);
    expect(dao.name).to.equal(name);
    expect(dao.tokenMint.toBase58()).to.equal(mint.toBase58());
  });

  it("Creates a proposal", async () => {
    const proposalAccount = anchor.web3.Keypair.generate();
    const title = "First Proposal";
    const description = "Let's do something!";
    const target = anchor.web3.Keypair.generate().publicKey;
    const amount = new anchor.BN(1000); // 1000 lamports

    await program.methods
      .createProposal(title, description, target, amount)
      .accounts({
        dao: daoAccount.publicKey,
        proposal: proposalAccount.publicKey,
        proposer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([proposalAccount])
      .rpc();

    const proposal = await program.account.proposal.fetch(proposalAccount.publicKey);
    expect(proposal.title).to.equal(title);
    expect(proposal.forVotes.toNumber()).to.equal(0);
    expect(proposal.target.toBase58()).to.equal(target.toBase58());
    expect(proposal.amount.toNumber()).to.equal(1000);
  });

  it("Casts a vote and executes", async () => {
    const proposalAccount = anchor.web3.Keypair.generate();
    const target = anchor.web3.Keypair.generate().publicKey;
    const amount = new anchor.BN(5000000); // 0.005 SOL
    
    // Create new proposal
    await program.methods
      .createProposal("Vote Test", "Voting...", target, amount)
      .accounts({
        dao: daoAccount.publicKey,
        proposal: proposalAccount.publicKey,
        proposer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([proposalAccount])
      .rpc();

    // Get token account and mint some tokens for voting power
    const ata = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        (provider.wallet as any).payer,
        mint,
        provider.wallet.publicKey
    );
    voterTokenAccount = ata.address;

    await mintTo(
        provider.connection,
        (provider.wallet as any).payer,
        mint,
        voterTokenAccount,
        provider.wallet.publicKey,
        1000
    );

    const [voteRecord] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalAccount.publicKey.toBuffer(), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .castVote(true) // Vote YES
      .accounts({
        proposal: proposalAccount.publicKey,
        voter: provider.wallet.publicKey,
        voterTokenAccount: voterTokenAccount,
        proposalDao: daoAccount.publicKey,
        voteRecord: voteRecord,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const proposalBefore = await program.account.proposal.fetch(proposalAccount.publicKey);
    expect(proposalBefore.forVotes.toNumber()).to.equal(1000);

    // Wait for voting period to end (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Execute proposal
    await program.methods
      .executeProposal()
      .accounts({
        proposal: proposalAccount.publicKey,
        dao: daoAccount.publicKey,
        target: target,
        treasury: daoAccount.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    const proposalAfter = await program.account.proposal.fetch(proposalAccount.publicKey);
    expect(proposalAfter.executed).to.be.true;

    const targetBalance = await provider.connection.getBalance(target);
    expect(targetBalance).to.equal(5000000);
  });
});
