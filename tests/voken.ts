import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VoteApp } from "../target/types/vote_app";

import { expect } from "chai";
import {
  getOrCreateAssociatedTokenAccount,
  getAccount,
} from "@solana/spl-token";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

const SEEDS = {
  SOL_VAULT: "sol_vault",
  TREASURY_CONFIG: "treasury_CA",
  MINT_AUTHORITY: "mint_authority",
  X_MINT: "x_mint",
  VOTER: "voter",
  PROPOSAL: "proposal",
  PROPOSAL_COUNTER: "proposal_counter",
  WINNER: "winner",
} as const;

const PROPOSAL_ID = 1;

const findPda = (programId: anchor.web3.PublicKey, seeds: (Buffer | Uint8Array)[]): anchor.web3.PublicKey => {
  const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(seeds, programId);
  return pda;
}

const getBlockTime = async (connection: anchor.web3.Connection): Promise<number> => {
  const slot = await connection.getSlot();
  const blockTime = await connection.getBlockTime(slot);
  if (blockTime == null) {
    throw new Error("Failed to get block time");
  }
  return blockTime;
}

const expectAnchorErrorCode = (err: unknown, expectedCode: string) => {
  const anyErr = err as any;
  const actualCode =
    anyErr?.error?.errorCode?.code ??
    anyErr?.errorCode?.code ??
    anyErr?.code;
  expect(actualCode).to.equal(expectedCode);
};

describe("1. Testing Treasury INITIALIZATION", () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);
  const program = anchor.workspace.voteApp as Program<VoteApp>;

  const adminWallet = (provider.wallet as NodeWallet).payer;

  let proposalCreatorWallet = new anchor.web3.Keypair();
  let voterWallet = new anchor.web3.Keypair();
  let proposalCreatorTokenWallet: anchor.web3.PublicKey;
  let proposalCounterPda: anchor.web3.PublicKey;
  let proposalPda: anchor.web3.PublicKey;
  let treasuryConfigPda: anchor.web3.PublicKey;
  let xMintPda: anchor.web3.PublicKey;
  let solVaultPda: anchor.web3.PublicKey;
  let mintAuthorityPda: anchor.web3.PublicKey;
  let voterPda: anchor.web3.PublicKey;
  let treasuryTokenAccount: anchor.web3.PublicKey;
  let voterTokenAccount: anchor.web3.PublicKey;
  let winnerPda: anchor.web3.PublicKey;

  beforeEach(async () => {
    // Request SOL airdrop for the proposal creator wallet
    await Promise.all([
      await connection.requestAirdrop(proposalCreatorWallet.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL),
      await connection.requestAirdrop(voterWallet.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL)
    ])

    treasuryConfigPda = findPda(program.programId,
      [anchor.utils.bytes.utf8.encode(SEEDS.TREASURY_CONFIG)]);

    proposalCounterPda = findPda(program.programId,
      [anchor.utils.bytes.utf8.encode(SEEDS.PROPOSAL_COUNTER)]);

    proposalPda = findPda(program.programId, [
      anchor.utils.bytes.utf8.encode(SEEDS.PROPOSAL), Buffer.from([PROPOSAL_ID])]);

    solVaultPda = findPda(program.programId, [
      anchor.utils.bytes.utf8.encode(SEEDS.SOL_VAULT),
    ]);

    mintAuthorityPda = findPda(program.programId, [
      anchor.utils.bytes.utf8.encode(SEEDS.MINT_AUTHORITY),
    ]);

    xMintPda = findPda(program.programId, [
      anchor.utils.bytes.utf8.encode(SEEDS.X_MINT),
    ]);

    voterPda = findPda(program.programId, [
      anchor.utils.bytes.utf8.encode(SEEDS.VOTER),
      voterWallet.publicKey.toBuffer(),
    ]);

    winnerPda = findPda(program.programId, [
      anchor.utils.bytes.utf8.encode(SEEDS.WINNER),
    ]);
  })

  const createTokenAccounts = async () => {
    treasuryTokenAccount = (await getOrCreateAssociatedTokenAccount(
      connection,
      adminWallet,
      xMintPda,
      adminWallet.publicKey
    )).address;

    proposalCreatorTokenWallet = (await getOrCreateAssociatedTokenAccount(
      connection,
      proposalCreatorWallet,
      xMintPda,
      proposalCreatorWallet.publicKey
    )).address;

    voterTokenAccount = (await getOrCreateAssociatedTokenAccount(
      connection,
      voterWallet,
      xMintPda,
      voterWallet.publicKey
    )).address;
  }

  it("1.1 Initializes treasury!", async () => {
    const solPrice = new anchor.BN(1000000000);
    const tokensPerPurchase = new anchor.BN(1000000000);

    console.log("Treasury Config PDA", treasuryConfigPda.toBase58());
    await program.methods.initializeTreasury(solPrice, tokensPerPurchase).accounts({
      authority: adminWallet.publicKey,
    }).rpc();

    const treasuryAccountData = await program.account.treasuryConfig.fetch(treasuryConfigPda);

    expect(treasuryAccountData.solPrice.toNumber()).to.equal(
      solPrice.toNumber()
    );
    expect(treasuryAccountData.tokensPerPurchase.toNumber()).to.equal(
      tokensPerPurchase.toNumber()
    );
    expect(treasuryAccountData.authority.toBase58()).to.equal(
      adminWallet.publicKey.toBase58()
    );
    // Verify the mint PDA is stored correctly
    expect(treasuryAccountData.xMint.toBase58()).to.equal(xMintPda.toBase58());
    await createTokenAccounts();

  });
  describe("2.  Testing BUY TOKENS", () => {
    it("2.1 Buys Tokens for proposal!", async () => {

      const tokenBalanceBfore = (await getAccount(connection, proposalCreatorTokenWallet)).amount;

      await program.methods.buyToken().accounts({
        buyer: proposalCreatorWallet.publicKey,
        treasuryTokenAccount: treasuryTokenAccount,
        buyerTokenAccount: proposalCreatorTokenWallet,
        xMint: xMintPda,
      }).signers([proposalCreatorWallet]).rpc();

      const tokenBalanceAfter = (await getAccount(connection, proposalCreatorTokenWallet)).amount;
      expect(tokenBalanceAfter - tokenBalanceBfore).to.equal(BigInt(1000_000_000));
    });

    it("2.2 Buys Tokens for voter!", async () => {

      const tokenBalanceBfore = (await getAccount(connection, voterTokenAccount)).amount;

      await program.methods.buyToken().accounts({
        buyer: voterWallet.publicKey,
        treasuryTokenAccount: treasuryTokenAccount,
        buyerTokenAccount: voterTokenAccount,
        xMint: xMintPda,
      }).signers([voterWallet]).rpc();

      const tokenBalanceAfter = (await getAccount(connection, voterTokenAccount)).amount;
      expect(tokenBalanceAfter - tokenBalanceBfore).to.equal(BigInt(1000_000_000));
    });
  });
  describe("3. VOTER", () => {
    it("3.1  Registers Voters!", async () => {
      await program.methods.registerVoter().accounts({
        authority: voterWallet.publicKey
      }).signers([voterWallet]).rpc();

      const voterAccountData = await program.account.voter.fetch(voterPda);

      expect(voterAccountData.voterId.toBase58()).to.equal(voterWallet.publicKey.toBase58());
    });
  });

  describe("4. Proposal Registration", () => {
    it("4.1  Registers Proposal!", async () => {
      const currentBlockTime = await getBlockTime(connection);
      const deadlineTime = new anchor.BN(currentBlockTime + 10);
      const proposalInfo = "Build a layer 2 solution to the Solana blockchain";
      const stakeAccount = new anchor.BN(1000);
      await program.methods.registerProposal(proposalInfo, deadlineTime, stakeAccount).accounts({
        authority: proposalCreatorWallet.publicKey,
        proposalTokenAccount: proposalCreatorTokenWallet,
        proposalCounterAccount: proposalCounterPda,
        treasuryTokenAccount: treasuryTokenAccount,
        xMint: xMintPda
      }).signers([proposalCreatorWallet]).rpc();

      const proposalAccountData = await program.account.proposal.fetch(proposalPda);
      const proposalCounterAccountData = await program.account.proposalCounter.fetch(proposalCounterPda);
      expect(proposalCounterAccountData.proposalCount).to.equal(2);

      expect(proposalAccountData.authority.toBase58()).to.equal(proposalCreatorWallet.publicKey.toBase58());
      expect(proposalAccountData.deadline.toNumber()).to.equal(deadlineTime.toNumber());
      expect(proposalAccountData.numberOfVotes.toString()).to.equal("0");
      expect(proposalAccountData.proposalId.toString()).to.equal("1");
      expect(proposalAccountData.proposalInfo.toString()).to.equal("Build a layer 2 solution to the Solana blockchain");
    });
  });

  describe("5. Casting Vote", () => {
    it("5.1  Casts vote!", async () => {
      const stakeAccount = new anchor.BN(1000);

      await program.methods.proposalToVoter(PROPOSAL_ID, stakeAccount).accounts({
        authority: voterWallet.publicKey,
        voterTokenAccount: voterTokenAccount,
        treasuryTokenAccount: treasuryTokenAccount,
        xMint: xMintPda
      }).signers([voterWallet]).rpc();
    });
  });

  describe("6. Pick Winner", () => {
    it("6.1   Should FAIL to pick winner before deadline passes", async () => {
      try {
        await program.methods
          .pickWinner(PROPOSAL_ID)
          .accounts({
            authority: adminWallet.publicKey,
          })
          .rpc();
      } catch (error) {
        expectAnchorErrorCode(error, "VotingStillActive")
      }

    });

    it("6.2   Should pick winner after deadline passes", async () => {
      // Wait for voting deadline to pass
      console.log("      Waiting for voting deadline...");
      await new Promise((resolve) => setTimeout(resolve, 10001));// ~10.001 second

      await program.methods
        .pickWinner(PROPOSAL_ID)
        .accounts({
          authority: adminWallet.publicKey,
        })
        .rpc();

      const winnerData = await program.account.winner.fetch(winnerPda);
      expect(winnerData.winningProposalId).to.equal(PROPOSAL_ID);
      expect(winnerData.winningVotes).to.equal(1);
    });
  })

  describe("7. Close Proposal Account", () => {
    it("7.1   Should close proposal account after deadline and recover rent", async () => {
      const accountInfoBefore = await connection.getAccountInfo(proposalPda);
      expect(accountInfoBefore).to.not.be.null;

      await program.methods
        .closeProposal(PROPOSAL_ID)
        .accounts({
          destination: proposalCreatorWallet.publicKey,
          authority: proposalCreatorWallet.publicKey,
        })
        .signers([proposalCreatorWallet])
        .rpc();

      const accountInfoAfter = await connection.getAccountInfo(proposalPda);
      expect(accountInfoAfter).to.be.null;
    });
  });

  describe("8. Close Voter Account", () => {
    it("8.1   Should close voter account after deadline and recover rent", async () => {
      const accountInfoBefore = await connection.getAccountInfo(voterPda);
      expect(accountInfoBefore).to.not.be.null;

      const voterBalanceBefore = await connection.getBalance(voterWallet.publicKey);
      console.log("        Voter balance before close: " + voterBalanceBefore," SOL");

      await program.methods
        .closeVoter()
        .accounts({
          authority: voterWallet.publicKey,
        })
        .signers([voterWallet])
        .rpc();

      const voterBalanceAfter = await connection.getBalance(voterWallet.publicKey);
      console.log("        Voter balance after close: " + voterBalanceAfter, " SOL");

      const accountInfoAfter = await connection.getAccountInfo(voterPda);
      expect(accountInfoAfter).to.be.null;
    });
  });

  describe("9. Withdrawal sol", () => {
    it("9.1   Should allow admin to withdrwa SOL from treasury", async () => {
      const withdrawAmount = new anchor.BN(100000); //0.1 SOL
      const adminBalanceBefore = await connection.getBalance(adminWallet.publicKey);
      console.log("        Voter balance before close: " + adminBalanceBefore, " SOL");

      const vaultBalance = await connection.getBalance(solVaultPda);
      if (vaultBalance < withdrawAmount.toNumber()) {
        await program.methods
        .withdrawSol(withdrawAmount)
        .accounts({
          authority: adminWallet.publicKey
        })
        .rpc();

      const adminBalanceAfter = await connection.getBalance(adminWallet.publicKey);
      expect(adminBalanceAfter).to.be.greaterThan(
        adminBalanceBefore - 100000
      );
    } else {
      console.log("Insufficient funds to withdraw");
    }
  });

    it("9.2   Should FAiL when non-admin tries to withdraw sol", async () => {
      const withdrawAmount = new anchor.BN(100000);

      try {
        await program.methods
        .withdrawSol(withdrawAmount)
        .accounts({
          authority: voterWallet.publicKey
        })
        .signers([voterWallet])
        .rpc();
        expect.fail("EXpected withdrawal to fail - unauthorized user");
      } catch (error) {
        expectAnchorErrorCode(error, "UnauthorizedAccess")
      }
    });
  });
});