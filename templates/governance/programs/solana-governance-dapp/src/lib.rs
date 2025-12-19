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
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        proposal.dao = dao.key();
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.title = title;
        proposal.description = description;
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

        // In a real DAO, we'd record the voter to prevent double voting.
        // For this scaffold, we keep it simple but functional for weight testing.

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
    #[account(init, payer = proposer, space = 8 + 32 + 32 + 100 + 500 + 8 + 8 + 8 + 8 + 8 + 1)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub voter: Signer<'info>,
    #[account(
        constraint = voter_token_account.owner == voter.key(),
        constraint = voter_token_account.mint == proposal_dao.token_mint
    )]
    pub voter_token_account: Account<'info, TokenAccount>,
    #[account(key = proposal.dao)]
    pub proposal_dao: Account<'info, Dao>,
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
    pub start_time: i64,
    pub end_time: i64,
    pub for_votes: u64,
    pub against_votes: u64,
    pub executed: bool,
}

#[error_code]
pub enum GovernanceError {
    #[msg("Voting period has ended.")]
    VotingEnded,
    #[msg("Voter has no tokens.")]
    NoVotingPower,
}
