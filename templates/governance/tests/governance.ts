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
    const votingPeriod = new anchor.BN(3600);
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

    const dao = await program.account.dao.fetch(daoAccount.publicKey);
    expect(dao.name).to.equal(name);
    expect(dao.tokenMint.toBase58()).to.equal(mint.toBase58());
  });

  it("Creates a proposal", async () => {
    const proposalAccount = anchor.web3.Keypair.generate();
    const title = "First Proposal";
    const description = "Let's do something!";

    await program.methods
      .createProposal(title, description)
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
  });

  it("Casts a vote", async () => {
    const proposalAccount = anchor.web3.Keypair.generate();
    
    // Create new proposal
    await program.methods
      .createProposal("Vote Test", "Voting...")
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

    await program.methods
      .castVote(true) // Vote YES
      .accounts({
        proposal: proposalAccount.publicKey,
        voter: provider.wallet.publicKey,
        voterTokenAccount: voterTokenAccount,
        proposalDao: daoAccount.publicKey,
      })
      .rpc();

    const proposal = await program.account.proposal.fetch(proposalAccount.publicKey);
    expect(proposal.forVotes.toNumber()).to.equal(1000);
  });
});
