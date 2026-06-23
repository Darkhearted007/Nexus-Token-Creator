//! # NexusChain — Fee Vault Smart Contract
//!
//! **Copyright © 2026 NexusChain. All rights reserved.**
//!
//! This smart contract implements the proprietary fee collection and withdrawal
//! mechanism for the NexusChain token launchpad. Reverse-engineering, unauthorized
//! modification, or use of this code in competing services is prohibited.
//!
//! **License**: See LICENSE file. This code is provided for inspection and auditing
//! purposes only. Proprietary fee logic is NOT covered by MIT license.
//!
//! **Security**: This program has been audited. All operations are on-chain verifiable.

use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("5hA4DvFa82zJS6yx5ahdb2HEKvmMx4zJeXTyZaWTA5A8");

// ─── Events ──────────────────────────────────────────────────────────────────

#[event]
pub struct ConfigInitialized {
    pub admin: Pubkey,
}

#[event]
pub struct PausedStateChanged {
    pub paused: bool,
    pub changed_by: Pubkey,
}

#[event]
pub struct FeeCollected {
    pub amount: u64,
    pub payer: Pubkey,
    pub total_fees_collected: u64,
}

#[event]
pub struct FeesWithdrawn {
    pub amount: u64,
    pub admin: Pubkey,
}

// ─── Program ─────────────────────────────────────────────────────────────────

#[program]
pub mod nexus_chain {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.total_fees_collected = 0;
        config.paused = false;
        msg!("Config initialized. Admin is set to: {:?}", config.admin);
        emit!(ConfigInitialized { admin: config.admin });
        Ok(())
    }

    pub fn set_paused(ctx: Context<UpdateConfig>, paused: bool) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.paused = paused;
        msg!("Program paused state set to: {}", paused);
        emit!(PausedStateChanged { paused, changed_by: ctx.accounts.admin.key() });
        Ok(())
    }

    pub fn collect_fee(ctx: Context<CollectFee>, amount: u64) -> Result<()> {
        require!(!ctx.accounts.config.paused, ErrorCode::ProgramPaused);
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        transfer(cpi_context, amount)?;

        let config = &mut ctx.accounts.config;
        config.total_fees_collected = config
            .total_fees_collected
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;

        msg!("Collected fee: {} lamports", amount);
        emit!(FeeCollected {
            amount,
            payer: ctx.accounts.user.key(),
            total_fees_collected: config.total_fees_collected,
        });
        Ok(())
    }

    pub fn withdraw_fees(ctx: Context<WithdrawFees>, amount: u64) -> Result<()> {
        require!(!ctx.accounts.config.paused, ErrorCode::ProgramPaused);
        require!(ctx.accounts.admin.key() == ctx.accounts.config.admin, ErrorCode::Unauthorized);
        require!(ctx.accounts.vault.lamports() >= amount, ErrorCode::InsufficientFunds);

        let vault_lamports = ctx.accounts.vault.lamports();
        let admin_lamports = ctx.accounts.admin.lamports();

        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? = vault_lamports
            .checked_sub(amount)
            .ok_or(ErrorCode::InsufficientFunds)?;
        **ctx.accounts.admin.to_account_info().try_borrow_mut_lamports()? = admin_lamports
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;

        msg!("Withdrawn {} lamports to admin", amount);
        emit!(FeesWithdrawn { amount, admin: ctx.accounts.admin.key() });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 8,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump,
        has_one = admin
    )]
    pub config: Account<'info, Config>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct CollectFee<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    /// CHECK: Vault is a PDA to hold collected SOL fees
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawFees<'info> {
    #[account(
        seeds = [b"config"],
        bump,
        has_one = admin
    )]
    pub config: Account<'info, Config>,
    /// CHECK: Vault is a PDA to hold SOL
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

#[account]
pub struct Config {
    pub admin: Pubkey,
    pub total_fees_collected: u64,
    pub paused: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("Insufficient funds in the vault to withdraw.")]
    InsufficientFunds,
    #[msg("The program is currently paused.")]
    ProgramPaused,
    #[msg("Arithmetic overflow detected.")]
    Overflow,
}
