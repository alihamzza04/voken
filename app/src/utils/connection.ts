import { Connection, PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  "G7Nr9x3JScCFfi8faNyQFQydPSqjMhk7fYKL8q6baeGK"
);

export const NETWORK = "localnet";
export const ENDPOINT = "http://127.0.0.1:8899";

export const connection = new Connection(ENDPOINT, "confirmed");

export const TREASURY_CONFIG_SEED = "treasury_config";
export const PROPOSAL_COUNTER_SEED = "proposal_counter";
export const PROPOSAL_SEED = "proposal";
export const VOTER_SEED = "voter";
export const WINNER_SEED = "winner";
export const MINT_AUTHORITY_SEED = "mint_authority";
export const SOL_VAULT_SEED = "sol_vault";

export async function getTreasuryConfigPDA(): Promise<PublicKey> {
  const [pubkey] = await PublicKey.findProgramAddress(
    [Buffer.from(TREASURY_CONFIG_SEED)],
    PROGRAM_ID
  );
  return pubkey;
}

export async function getProposalCounterPDA(): Promise<PublicKey> {
  const [pubkey] = await PublicKey.findProgramAddress(
    [Buffer.from(PROPOSAL_COUNTER_SEED)],
    PROGRAM_ID
  );
  return pubkey;
}

export async function getProposalPDA(proposalId: number): Promise<PublicKey> {
  const [pubkey] = await PublicKey.findProgramAddress(
    [Buffer.from(PROPOSAL_SEED), Buffer.from([proposalId])],
    PROGRAM_ID
  );
  return pubkey;
}

export async function getVoterPDA(wallet: PublicKey): Promise<PublicKey> {
  const [pubkey] = await PublicKey.findProgramAddress(
    [Buffer.from(VOTER_SEED), wallet.toBuffer()],
    PROGRAM_ID
  );
  return pubkey;
}

export async function getWinnerPDA(): Promise<PublicKey> {
  const [pubkey] = await PublicKey.findProgramAddress(
    [Buffer.from(WINNER_SEED)],
    PROGRAM_ID
  );
  return pubkey;
}

export async function getMintAuthorityPDA(): Promise<PublicKey> {
  const [pubkey] = await PublicKey.findProgramAddress(
    [Buffer.from(MINT_AUTHORITY_SEED)],
    PROGRAM_ID
  );
  return pubkey;
}

export async function getSolVaultPDA(): Promise<PublicKey> {
  const [pubkey] = await PublicKey.findProgramAddress(
    [Buffer.from(SOL_VAULT_SEED)],
    PROGRAM_ID
  );
  return pubkey;
}
