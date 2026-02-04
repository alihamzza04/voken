import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export interface TreasuryConfig {
  authority: PublicKey;
  bump: number;
  solPrice: BN;
  xMint: PublicKey;
  tokensPerPurchase: BN;
}

export interface Voter {
  voterId: PublicKey;
}

export interface Proposal {
  proposalId: number;
  proposalInfo: string;
  deadline: BN;
  authority: PublicKey;
  numberOfVotes: number;
}

export interface ProposalCounter {
  proposalCount: number;
  authority: PublicKey;
}

export interface Winner {
  winningProposalId: number;
  winningVotes: number;
  proposalInfo: string;
  declaredAt: BN;
}

export interface TreasuryConfigData {
  authority: PublicKey;
  bump: number;
  solPrice: number;
  xMint: PublicKey;
  tokensPerPurchase: number;
}

export interface VoterData {
  voterId: PublicKey;
}

export interface ProposalData {
  proposalId: number;
  proposalInfo: string;
  deadline: number;
  authority: PublicKey;
  numberOfVotes: number;
  status: "active" | "ended" | "closed";
}

export interface ProposalCounterData {
  proposalCount: number;
  authority: PublicKey;
}

export interface WinnerData {
  winningProposalId: number;
  winningVotes: number;
  proposalInfo: string;
  declaredAt: number;
}
