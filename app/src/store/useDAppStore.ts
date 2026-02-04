import { create } from "zustand";
import { PublicKey } from "@solana/web3.js";

export interface Proposal {
  proposalId: number;
  proposalInfo: string;
  deadline: number;
  authority: PublicKey;
  numberOfVotes: number;
  status: "active" | "ended" | "closed";
}

export interface Voter {
  voterId: PublicKey;
  hasVoted: boolean;
  votedProposalId?: number;
}

export interface TreasuryConfig {
  authority: PublicKey;
  bump: number;
  solPrice: number;
  xMint: PublicKey;
  tokensPerPurchase: number;
}

export interface Winner {
  winningProposalId: number;
  winningVotes: number;
  proposalInfo: string;
  declaredAt: number;
}

interface DAppState {
  isLoading: boolean;
  error: string | null;
  treasuryConfig: TreasuryConfig | null;
  proposals: Proposal[];
  currentWinner: Winner | null;
  userTokenBalance: number;
  userSolBalance: number;
  isVoterRegistered: boolean;
  userHasVoted: boolean;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTreasuryConfig: (config: TreasuryConfig | null) => void;
  setProposals: (proposals: Proposal[]) => void;
  addProposal: (proposal: Proposal) => void;
  updateProposal: (id: number, updates: Partial<Proposal>) => void;
  setCurrentWinner: (winner: Winner | null) => void;
  setUserTokenBalance: (balance: number) => void;
  setUserSolBalance: (balance: number) => void;
  setVoterRegistered: (registered: boolean) => void;
  setUserHasVoted: (voted: boolean) => void;
  clearError: () => void;
}

export const useDAppStore = create<DAppState>((set) => ({
  isLoading: false,
  error: null,
  treasuryConfig: null,
  proposals: [],
  currentWinner: null,
  userTokenBalance: 0,
  userSolBalance: 0,
  isVoterRegistered: false,
  userHasVoted: false,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setTreasuryConfig: (config) => set({ treasuryConfig: config }),
  setProposals: (proposals) => set({ proposals }),
  addProposal: (proposal) =>
    set((state) => ({
      proposals: [...state.proposals, proposal],
    })),
  updateProposal: (id, updates) =>
    set((state) => ({
      proposals: state.proposals.map((p) =>
        p.proposalId === id ? { ...p, ...updates } : p
      ),
    })),
  setCurrentWinner: (winner) => set({ currentWinner: winner }),
  setUserTokenBalance: (balance) => set({ userTokenBalance: balance }),
  setUserSolBalance: (balance) => set({ userSolBalance: balance }),
  setVoterRegistered: (registered) => set({ isVoterRegistered: registered }),
  setUserHasVoted: (voted) => set({ userHasVoted: voted }),
  clearError: () => set({ error: null }),
}));
