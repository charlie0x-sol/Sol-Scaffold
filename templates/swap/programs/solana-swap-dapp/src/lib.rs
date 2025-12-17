use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solana_swap_dapp {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        fee: u16,
    ) -> Result<()> {
        let swap_info = &mut ctx.accounts.swap_info;
        swap_info.token_a = ctx.accounts.token_a.key();
        swap_info.token_b = ctx.accounts.token_b.key();
        swap_info.fee = fee;
        Ok(())
    }

    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        min_amount_out: u64,
    ) -> Result<()> {
        let swap_info = &ctx.accounts.swap_info;
        let user_token_in = &ctx.accounts.user_token_in;
        let user_token_out = &ctx.accounts.user_token_out;
        let vault_token_in = &ctx.accounts.vault_token_in;
        let vault_token_out = &ctx.accounts.vault_token_out;
        let token_program = &ctx.accounts.token_program;

        let amount_out = (vault_token_out.amount * amount_in) / (vault_token_in.amount + amount_in);
        let fee = (amount_out * swap_info.fee as u64) / 10000;
        let final_amount_out = amount_out - fee;

        if final_amount_out < min_amount_out {
            return Err(ErrorCode::Slippage.into());
        }

        let cpi_accounts_in = anchor_spl::token::Transfer {
            from: user_token_in.to_account_info(),
            to: vault_token_in.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program_in = token_program.to_account_info();
        let cpi_ctx_in = CpiContext::new(cpi_program_in, cpi_accounts_in);
        anchor_spl::token::transfer(cpi_ctx_in, amount_in)?;

        let cpi_accounts_out = anchor_spl::token::Transfer {
            from: vault_token_out.to_account_info(),
            to: user_token_out.to_account_info(),
            authority: vault_token_out.to_account_info(),
        };
        let cpi_program_out = token_program.to_account_info();
        let cpi_ctx_out = CpiContext::new(cpi_program_out, cpi_accounts_out);
        anchor_spl::token::transfer(cpi_ctx_out, final_amount_out)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 32 + 32 + 2)]
    pub swap_info: Account<'info, SwapInfo>,
    pub token_a: Account<'info, anchor_spl::token::Mint>,
    pub token_b: Account<'info, anchor_spl::token::Mint>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub swap_info: Account<'info, SwapInfo>,
    #[account(mut)]
    pub user_token_in: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub user_token_out: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub vault_token_in: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub vault_token_out: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
}

#[account]
pub struct SwapInfo {
    pub token_a: Pubkey,
    pub token_b: Pubkey,
    pub fee: u16,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Slippage tolerance exceeded")]
    Slippage,
}
