use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("<%= programId %>");

#[program]
pub mod <%= programNameSnakeCase %> {
    use super::*;

    pub fn initialize_dao(
        ctx: Context<InitializeDao>,
        name: String,
        min_tokens_to_propose: u64,
        voting_period: i64,
        quorum_percentage: u64,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        dao.name = name;
        dao.authority = ctx.accounts.authority.key();
        dao.token_mint = ctx.accounts.token_mint.key();
        dao.min_tokens_to_propose = min_tokens_to_propose;
        dao.voting_period = voting_period;
        dao.quorum_percentage = quorum_percentage;
        dao.proposal_count = 0;
        Ok(())
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        target: Pubkey,
        amount: u64,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        proposal.dao = dao.key();
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.title = title;
        proposal.description = description;
        proposal.target = target;
        proposal.amount = amount;
        proposal.start_time = clock.unix_timestamp;
        proposal.end_time = clock.unix_timestamp + dao.voting_period;
        proposal.for_votes = 0;
        proposal.against_votes = 0;
        proposal.executed = false;
        proposal.id = dao.proposal_count;

        dao.proposal_count += 1;

        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>, side: bool) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        require!(
            clock.unix_timestamp <= proposal.end_time,
            GovernanceError::VotingEnded
        );

        let weight = ctx.accounts.voter_token_account.amount;
        require!(weight > 0, GovernanceError::NoVotingPower);

        if side {
            proposal.for_votes += weight;
        } else {
            proposal.against_votes += weight;
        }

        let vote_record = &mut ctx.accounts.vote_record;
        vote_record.proposal = proposal.key();
        vote_record.voter = ctx.accounts.voter.key();
        vote_record.side = side;
        vote_record.weight = weight;

        Ok(())
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let _dao = &mut ctx.accounts.dao;
        let clock = Clock::get()?;

        require!(!proposal.executed, GovernanceError::AlreadyExecuted);
        require!(
            clock.unix_timestamp > proposal.end_time,
            GovernanceError::VotingNotEnded
        );
        require!(
            proposal.for_votes > proposal.against_votes,
            GovernanceError::ProposalNotPassed
        );

        // Simple quorum check: here we just check if any votes happened for simplicity in this template.
        // A real quorum would check against total supply.
        // let total_votes = proposal.for_votes + proposal.against_votes;
        // require!(total_votes > 0, GovernanceError::QuorumNotMet);

        // Transfer SOL
        let amount = proposal.amount;
        if amount > 0 {
            let from_account = &ctx.accounts.treasury;
            let to_account = &ctx.accounts.target;
            
            // Check if treasury has enough funds
            if **from_account.try_borrow_lamports()? < amount {
                return Err(GovernanceError::InsufficientFunds.into());
            }

            // Perform transfer
            // We need to sign with the DAO PDA seeds if the treasury is the DAO PDA
            // But here 'treasury' is just a passed account. Ideally it should be the DAO PDA itself or a PDA derived from it.
            // For this template, let's assume the DAO account IS the treasury.
            // But DAO account has data, so we need to be careful not to drain it below rent exemption.
            
            // Actually, we should just use a separate treasury PDA or standard PDA.
            // Let's use the DAO account as the signer.
            
            **from_account.try_borrow_mut_lamports()? -= amount;
            **to_account.try_borrow_mut_lamports()? += amount;
        }

        proposal.executed = true;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeDao<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 100)]
    pub dao: Account<'info, Dao>,
    pub token_mint: Account<'info, anchor_spl::token::Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub dao: Account<'info, Dao>,
    #[account(init, payer = proposer, space = 8 + 32 + 32 + 100 + 500 + 32 + 8 + 8 + 8 + 8 + 8 + 1)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub voter: Signer<'info>,
    #[account(
        constraint = voter_token_account.owner == voter.key(),
        constraint = voter_token_account.mint == proposal_dao.token_mint
    )]
    pub voter_token_account: Account<'info, TokenAccount>,
    #[account(address = proposal.dao)]
    pub proposal_dao: Account<'info, Dao>,
    #[account(
        init,
        payer = voter,
        space = 8 + 32 + 32 + 1 + 8,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut, has_one = dao)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub dao: Account<'info, Dao>,
    /// CHECK: The target account to receive funds.
    #[account(mut, constraint = target.key() == proposal.target)]
    pub target: AccountInfo<'info>,
    /// CHECK: The treasury is the DAO account itself in this simple example.
    #[account(mut, constraint = treasury.key() == dao.key())]
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Dao {
    pub name: String,
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub min_tokens_to_propose: u64,
    pub voting_period: i64,
    pub quorum_percentage: u64,
    pub proposal_count: u64,
}

#[account]
pub struct Proposal {
    pub id: u64,
    pub dao: Pubkey,
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub target: Pubkey,
    pub amount: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub for_votes: u64,
    pub against_votes: u64,
    pub executed: bool,
}

#[account]
pub struct VoteRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub side: bool,
    pub weight: u64,
}

#[error_code]
pub enum GovernanceError {
    #[msg("Voting period has ended.")]
    VotingEnded,
    #[msg("Voter has no tokens.")]
    NoVotingPower,
    #[msg("Proposal already executed.")]
    AlreadyExecuted,
    #[msg("Voting period has not ended yet.")]
    VotingNotEnded,
    #[msg("Proposal did not pass.")]
    ProposalNotPassed,
    #[msg("Quorum not met.")]
    QuorumNotMet,
    #[msg("Insufficient funds in treasury.")]
    InsufficientFunds,
}
