import { useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Keypair,
} from "@solana/web3.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProgram, PROGRAM_ID } from "../utils/program";
import {
  getTreasuryConfigPDA,
  getProposalCounterPDA,
  getProposalPDA,
  getVoterPDA,
  getWinnerPDA,
  getSolVaultPDA,
  getMintAuthorityPDA,
  connection,
} from "../utils/connection";
import * as anchor from "@coral-xyz/anchor";
import toast from "react-hot-toast";
import {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import type { TreasuryConfigData } from "../types/program";

export function useSolBalance() {
  const { publicKey, connected } = useWallet();

  return useQuery({
    queryKey: ["solBalance", publicKey?.toString()],
    queryFn: async () => {
      if (!publicKey) return 0;
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    },
    enabled: connected && !!publicKey,
    refetchInterval: 10000,
  });
}

export function useTreasuryConfig() {
  const { connected } = useWallet();

  return useQuery({
    queryKey: ["treasuryConfig"],
    queryFn: async () => {
      const program = getProgram();
      const treasuryConfigPDA = await getTreasuryConfigPDA();
      try {
        const account = (await (program.account as any).treasuryConfig.fetch(
          treasuryConfigPDA
        )) as TreasuryConfigData;
        return {
          authority: account.authority,
          bump: account.bump,
          solPrice: account.solPrice,
          xMint: account.xMint,
          tokensPerPurchase: account.tokensPerPurchase,
        };
      } catch {
        return null;
      }
    },
    enabled: connected,
    refetchInterval: 5000,
  });
}

export function useProposals() {
  const { connected } = useWallet();

  return useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const program = getProgram();
      const proposalCounterPDA = await getProposalCounterPDA();
      let proposals: any[] = [];

      try {
        const counter = await (program.account as any).proposalCounter.fetch(
          proposalCounterPDA
        );
        const proposalCount = counter.proposalCount as number;

        for (let i = 1; i < proposalCount; i++) {
          try {
            const proposalPDA = await getProposalPDA(i);
            const proposal = await (program.account as any).proposal.fetch(
              proposalPDA
            );
            const now = Math.floor(Date.now() / 1000);
            const status =
              now >= (proposal.deadline as anchor.BN).toNumber()
                ? "ended"
                : "active";

            proposals.push({
              proposalId: proposal.proposalId as number,
              proposalInfo: proposal.proposalInfo as string,
              deadline: (proposal.deadline as anchor.BN).toNumber(),
              authority: proposal.authority as PublicKey,
              numberOfVotes: proposal.numberOfVotes as number,
              status,
            });
          } catch {
            continue;
          }
        }
      } catch {
        proposals = [];
      }

      return proposals;
    },
    enabled: connected,
    refetchInterval: 5000,
  });
}

export function useCurrentWinner() {
  const { connected } = useWallet();

  return useQuery({
    queryKey: ["currentWinner"],
    queryFn: async () => {
      const program = getProgram();
      const winnerPDA = await getWinnerPDA();
      try {
        const winner = await (program.account as any).winner.fetch(winnerPDA);
        return {
          winningProposalId: winner.winningProposalId as number,
          winningVotes: winner.winningVotes as number,
          proposalInfo: winner.proposalInfo as string,
          declaredAt: (winner.declaredAt as anchor.BN).toNumber(),
        };
      } catch {
        return null;
      }
    },
    enabled: connected,
    refetchInterval: 5000,
  });
}

export function useIsVoterRegistered() {
  const { publicKey, connected } = useWallet();

  return useQuery({
    queryKey: ["isVoterRegistered", publicKey?.toString()],
    queryFn: async () => {
      if (!publicKey) return false;
      const program = getProgram();
      const voterPDA = await getVoterPDA(publicKey);
      try {
        await (program.account as any).voter.fetch(voterPDA);
        return true;
      } catch {
        return false;
      }
    },
    enabled: connected && !!publicKey,
    refetchInterval: 5000,
  });
}

export function useInitializeTreasury() {
  const { publicKey, sendTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      solPrice: number;
      tokensPerPurchase: number;
    }) => {
      if (!publicKey) throw new Error("Wallet not connected");

      const mintAuthorityPDA = await getMintAuthorityPDA();
      const treasuryConfigPDA = await getTreasuryConfigPDA();
      const proposalCounterPDA = await getProposalCounterPDA();
      const solVaultPDA = await getSolVaultPDA();

      // Create a new mint account
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;

      // Get minimum rent for accounts
      const mintRent = await connection.getMinimumBalanceForRentExemption(82);
      const treasuryConfigRent =
        await connection.getMinimumBalanceForRentExemption(64);
      const proposalCounterRent =
        await connection.getMinimumBalanceForRentExemption(16);
      const solVaultRent = await connection.getMinimumBalanceForRentExemption(
        128
      );

      // Build transaction with all account creations
      const initTx = new anchor.web3.Transaction();

      // 1. Create mint account
      initTx.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint,
          space: 82,
          lamports: mintRent,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mint,
          9,
          mintAuthorityPDA,
          null,
          TOKEN_PROGRAM_ID
        ),
        // 2. Create treasury config account
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: treasuryConfigPDA,
          space: 64,
          lamports: treasuryConfigRent,
          programId: PROGRAM_ID,
        }),
        // 3. Create proposal counter account
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: proposalCounterPDA,
          space: 16,
          lamports: proposalCounterRent,
          programId: PROGRAM_ID,
        }),
        // 4. Create sol vault account
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: solVaultPDA,
          space: 128,
          lamports: solVaultRent,
          programId: PROGRAM_ID,
        })
      );

      // 5. Add initialize treasury instruction
      const program = getProgram();
      initTx.add(
        await program.methods
          .initializeTreasury(
            new anchor.BN(params.solPrice),
            new anchor.BN(params.tokensPerPurchase)
          )
          .accounts({
            authority: publicKey,
            treasuryConfigAccount: treasuryConfigPDA,
            proposalCounterAccount: proposalCounterPDA,
            xMint: mint,
            mintAuthority: mintAuthorityPDA,
            solVault: solVaultPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      );

      const latestBlockhash = await connection.getLatestBlockhash();
      initTx.feePayer = publicKey;
      initTx.recentBlockhash = latestBlockhash.blockhash;

      const signature = await sendTransaction(initTx, connection, {
        signers: [mintKeypair],
      });
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      return signature;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treasuryConfig"] });
      toast.success("Treasury initialized successfully!");
    },
    onError: (error: Error) => {
      console.error("Initialize error:", error);
      toast.error(error.message || "Failed to initialize treasury");
    },
  });
}

export function useRegisterVoter() {
  const { publicKey, sendTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!publicKey) throw new Error("Wallet not connected");

      const program = getProgram();
      const voterPDA = await getVoterPDA(publicKey);

      const tx = await program.methods
        .registerVoter()
        .accounts({
          authority: publicKey,
          voterAccount: voterPDA,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.feePayer = publicKey;
      tx.recentBlockhash = latestBlockhash.blockhash;

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      return signature;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isVoterRegistered"] });
      toast.success("Successfully registered as voter!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to register voter");
    },
  });
}

export function useCreateProposal() {
  const { publicKey, sendTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      proposalInfo: string;
      deadline: number;
      tokenAmount: number;
    }) => {
      if (!publicKey) throw new Error("Wallet not connected");

      const program = getProgram();
      const proposalCounterPDA = await getProposalCounterPDA();
      const counter = await (program.account as any).proposalCounter.fetch(
        proposalCounterPDA
      );
      const proposalId = counter.proposalCount as number;
      const proposalPDA = await getProposalPDA(proposalId);

      const treasuryConfigPDA = await getTreasuryConfigPDA();
      const treasuryConfig = await (
        program.account as any
      ).treasuryConfig.fetch(treasuryConfigPDA);
      const xMint = treasuryConfig.xMint as PublicKey;

      const proposalTokenAccount = await getAssociatedTokenAddress(
        xMint,
        proposalPDA,
        true
      );
      const treasuryTokenAccount = await getAssociatedTokenAddress(
        xMint,
        treasuryConfigPDA,
        true
      );

      const tx = await program.methods
        .registerProposal(
          params.proposalInfo,
          new anchor.BN(params.deadline),
          new anchor.BN(params.tokenAmount)
        )
        .accounts({
          authority: publicKey,
          proposalAccount: proposalPDA,
          proposalTokenAccount,
          treasuryTokenAccount,
          proposalCounterAccount: proposalCounterPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .transaction();

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.feePayer = publicKey;
      tx.recentBlockhash = latestBlockhash.blockhash;

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      return signature;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Proposal created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create proposal");
    },
  });
}

export function useVote() {
  const { publicKey, sendTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { proposalId: number; tokenAmount: number }) => {
      if (!publicKey) throw new Error("Wallet not connected");

      const program = getProgram();
      const proposalPDA = await getProposalPDA(params.proposalId);
      const voterPDA = await getVoterPDA(publicKey);

      const treasuryConfigPDA = await getTreasuryConfigPDA();
      const treasuryConfig = await (
        program.account as any
      ).treasuryConfig.fetch(treasuryConfigPDA);
      const xMint = treasuryConfig.xMint as PublicKey;

      const voterTokenAccount = await getAssociatedTokenAddress(
        xMint,
        publicKey
      );
      const treasuryTokenAccount = await getAssociatedTokenAddress(
        xMint,
        treasuryConfigPDA,
        true
      );

      const tx = await program.methods
        .proposalToVoter(params.proposalId, new anchor.BN(params.tokenAmount))
        .accounts({
          authority: publicKey,
          proposalAccount: proposalPDA,
          voterAccount: voterPDA,
          voterTokenAccount,
          treasuryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .transaction();

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.feePayer = publicKey;
      tx.recentBlockhash = latestBlockhash.blockhash;

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      return signature;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Vote cast successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cast vote");
    },
  });
}

export function usePickWinner() {
  const { publicKey, sendTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: number) => {
      if (!publicKey) throw new Error("Wallet not connected");

      const program = getProgram();
      const proposalPDA = await getProposalPDA(proposalId);
      const winnerPDA = await getWinnerPDA();

      const tx = await program.methods
        .pickWinner(proposalId)
        .accounts({
          authority: publicKey,
          proposalAccount: proposalPDA,
          winnerAccount: winnerPDA,
        })
        .transaction();

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.feePayer = publicKey;
      tx.recentBlockhash = latestBlockhash.blockhash;

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      return signature;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentWinner"] });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Winner picked successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to pick winner");
    },
  });
}

export function useWithdrawSol() {
  const { publicKey, sendTransaction } = useWallet();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!publicKey) throw new Error("Wallet not connected");

      const program = getProgram();
      const treasuryConfigPDA = await getTreasuryConfigPDA();
      const solVaultPDA = await getSolVaultPDA();

      const tx = await program.methods
        .withdrawSol(new anchor.BN(amount))
        .accounts({
          authority: publicKey,
          treasuryConfig: treasuryConfigPDA,
          solVault: solVaultPDA,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.feePayer = publicKey;
      tx.recentBlockhash = latestBlockhash.blockhash;

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      return signature;
    },
    onSuccess: () => {
      toast.success("SOL withdrawn successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to withdraw SOL");
    },
  });
}

export function useBuyTokens() {
  const { publicKey, sendTransaction } = useWallet();

  return useMutation({
    mutationFn: async () => {
      if (!publicKey) throw new Error("Wallet not connected");

      const program = getProgram();
      const treasuryConfigPDA = await getTreasuryConfigPDA();
      const treasuryConfig = await (
        program.account as any
      ).treasuryConfig.fetch(treasuryConfigPDA);
      const xMint = treasuryConfig.xMint as PublicKey;

      const buyerTokenAccount = await getAssociatedTokenAddress(
        xMint,
        publicKey
      );
      const mintAuthorityPDA = await getMintAuthorityPDA();

      const tx = await program.methods
        .buyToken()
        .accounts({
          buyer: publicKey,
          buyerTokenAccount,
          treasuryConfigAccount: treasuryConfigPDA,
          xMint,
          mintAuthority: mintAuthorityPDA,
          solVault: await getSolVaultPDA(),
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.feePayer = publicKey;
      tx.recentBlockhash = latestBlockhash.blockhash;

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      return signature;
    },
    onSuccess: () => {
      toast.success("Tokens purchased successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to buy tokens");
    },
  });
}
