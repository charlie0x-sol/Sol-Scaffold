use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solana_lending_dapp {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        interest_rate: u16,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.token_mint = ctx.accounts.token_mint.key();
        market.interest_rate = interest_rate;
        Ok(())
    }

    pub fn init_user(ctx: Context<InitUser>) -> Result<()> {
        Ok(())
    }

    pub fn deposit(
        ctx: Context<Deposit>,
        amount: u64,
    ) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        anchor_spl::token::transfer(cpi_ctx, amount)?;
        
        user_account.deposited_amount += amount;
        Ok(())
    }

    pub fn borrow(
        ctx: Context<Borrow>,
        amount: u64,
    ) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        
        // Simple LTV check: Max borrow is 50% of deposited amount
        if user_account.borrowed_amount + amount > user_account.deposited_amount / 2 {
            return Err(ErrorCode::InsufficientCollateral.into());
        }

        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault_token_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        anchor_spl::token::transfer(cpi_ctx, amount)?;
        
        user_account.borrowed_amount += amount;
        Ok(())
    }

    pub fn repay(
        ctx: Context<Repay>,
        amount: u64,
    ) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;

        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        anchor_spl::token::transfer(cpi_ctx, amount)?;

        if user_account.borrowed_amount >= amount {
             user_account.borrowed_amount -= amount;
        } else {
             user_account.borrowed_amount = 0;
        }
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitUser<'info> {
    #[account(init, payer = user, space = 8 + 8 + 8)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
}

#[account]
pub struct UserAccount {
    pub deposited_amount: u64,
    pub borrowed_amount: u64,
}

#[account]
pub struct Market {
    pub token_mint: Pubkey,
    pub interest_rate: u16,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient collateral")]
    InsufficientCollateral,
}
