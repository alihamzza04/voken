use anchor_lang::prelude::*;

#[error_code]
pub enum VoteError {
    #[msg("Invalid deadline")]
    InvalidDeadline,

    #[msg("Proposal counter already initialized")]
    ProposalCounterAlreadyInitaialized,

    #[msg("Proposal Counter is in overflow condition")]
    ProposalCounterOverflow,

    #[msg("Proposal already ended")]
    ProposalEnded,

    #[msg("Proposal voters is in overflow condition")]
    ProposalVotesOverflow,

    #[msg("No votes found")]
    NoVotes,

    #[msg("Voting still Going on")]
    VotingStillActive,

    #[msg("You don't have access to close this account")]
    UnauthorizedAccess,

    #[msg("Token Mint Mismatching...")]
    TokenMintMismatch
}