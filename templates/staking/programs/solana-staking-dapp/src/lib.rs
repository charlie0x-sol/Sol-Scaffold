use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solana_staking_dapp {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        reward_rate: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.token_mint = ctx.accounts.token_mint.key();
        pool.reward_rate = reward_rate;
        Ok(())
    }

    pub fn init_stake(ctx: Context<InitStake>) -> Result<()> {
        Ok(())
    }

    pub fn stake(
        ctx: Context<Stake>,
        amount: u64,
    ) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        let clock = Clock::get()?;

        if user_stake.amount > 0 {
             // Claim pending rewards before adding more stake (simplified: just reset time)
             // In a real app, you'd calculate and payout here.
        }

        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        anchor_spl::token::transfer(cpi_ctx, amount)?;

        user_stake.amount += amount;
        user_stake.staked_at = clock.unix_timestamp;
        Ok(())
    }

    pub fn unstake(
        ctx: Context<Unstake>,
        amount: u64,
    ) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        let pool = &ctx.accounts.pool;
        let clock = Clock::get()?;

        if amount > user_stake.amount {
            return Err(ErrorCode::InsufficientFunds.into());
        }

        // Calculate rewards
        let time_diff = clock.unix_timestamp - user_stake.staked_at;
        let reward = (time_diff as u64) * pool.reward_rate * amount / 100000; // Simplified rate

        // Transfer principal
        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault_token_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        anchor_spl::token::transfer(cpi_ctx, amount)?;

        // Transfer reward (mocking: assuming vault has extra tokens for rewards)
        // In reality, you might mint new tokens or have a separate reward vault.
        // We'll reuse the vault transfer for simplicity of the snippet.
        if reward > 0 {
            let cpi_accounts_reward = anchor_spl::token::Transfer {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.vault_token_account.to_account_info(),
            };
            let cpi_ctx_reward = CpiContext::new(cpi_program, cpi_accounts_reward);
            anchor_spl::token::transfer(cpi_ctx_reward, reward)?;
        }

        user_stake.amount -= amount;
        user_stake.staked_at = clock.unix_timestamp; // Reset timer for remaining stake
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitStake<'info> {
    #[account(init, payer = user, space = 8 + 8 + 8)]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 32 + 8)]
    pub pool: Account<'info, Pool>,
    pub token_mint: Account<'info, anchor_spl::token::Mint>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut)]
    pub user_token_account: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut)]
    pub user_token_account: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
}

#[account]
pub struct Pool {
    pub token_mint: Pubkey,
    pub reward_rate: u64,
}

#[account]
pub struct UserStake {
    pub amount: u64,
    pub staked_at: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient staked funds")]
    InsufficientFunds,
}
