use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("5hA4DvFa82zJS6yx5ahdb2HEKvmMx4zJeXTyZaWTA5A8");

#[program]
pub mod nexus_chain {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.total_fees_collected = 0;
        config.paused = false;
        msg!("Config initialized. Admin is set to: {:?}", config.admin);
        Ok(())
    }

    pub fn set_paused(ctx: Context<UpdateConfig>, paused: bool) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.paused = paused;
        msg!("Program paused state set to: {}", paused);
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
        config.total_fees_collected = config.total_fees_collected.checked_add(amount).unwrap();
        
        msg!("Collected fee: {} lamports", amount);
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
            .unwrap();
        **ctx.accounts.admin.to_account_info().try_borrow_mut_lamports()? = admin_lamports
            .checked_add(amount)
            .unwrap();

        msg!("Withdrawn {} lamports to admin", amount);
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
}
