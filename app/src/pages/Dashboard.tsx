import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Vote, Users, Clock, Trophy, ArrowRight, Wallet } from "lucide-react";
import { useProposals, useCurrentWinner } from "../hooks/useProgram";
import { useIsVoterRegistered } from "../hooks/useProgram";
import { formatDate, getTimeRemaining } from "../lib/utils";

export function Dashboard() {
  const { connected } = useWallet();
  const { data: proposals, isLoading: proposalsLoading } = useProposals();
  const { data: currentWinner } = useCurrentWinner();
  const { data: isVoterRegistered } = useIsVoterRegistered();

  const activeProposals = proposals?.filter((p) => p.status === "active") || [];
  const totalVotes =
    proposals?.reduce((sum, p) => sum + p.numberOfVotes, 0) || 0;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-12 rounded-3xl max-w-lg"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-green-500/20 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            Welcome to Voken
          </h1>
          <p className="text-gray-400 mb-8">
            Connect your Solana wallet to participate in decentralized
            governance, vote on proposals, and shape the future of the
            ecosystem.
          </p>
          <p className="text-sm text-gray-500">
            Supports Phantom, Solflare, and other Solana wallets
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              DAO Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              {isVoterRegistered
                ? "You are registered as a voter"
                : "Register as a voter to participate in governance"}
            </p>
          </div>
          <div className="flex gap-4">
            {!isVoterRegistered && (
              <Link
                to="/profile"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-green-600 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Register to Vote
              </Link>
            )}
            <Link
              to="/proposals"
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              View Proposals
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Vote className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Proposals</p>
              <p className="text-2xl font-bold">{proposals?.length || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Proposals</p>
              <p className="text-2xl font-bold">{activeProposals.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Votes</p>
              <p className="text-2xl font-bold">{totalVotes}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Winner Declared</p>
              <p className="text-2xl font-bold">
                {currentWinner ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Active Proposals
          </h2>
          {proposalsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : activeProposals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No active proposals</p>
              <Link
                to="/create"
                className="text-purple-400 hover:text-purple-300 mt-2 inline-block"
              >
                Create one now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeProposals.slice(0, 5).map((proposal) => (
                <Link
                  key={proposal.proposalId}
                  to={`/proposals/${proposal.proposalId}`}
                  className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {proposal.proposalInfo}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span>#{proposal.proposalId}</span>
                        <span>{proposal.numberOfVotes} votes</span>
                        <span className="text-green-400">
                          {getTimeRemaining(proposal.deadline)} left
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
              {activeProposals.length > 5 && (
                <Link
                  to="/proposals"
                  className="block text-center py-3 text-purple-400 hover:text-purple-300 text-sm"
                >
                  View all {activeProposals.length} proposals
                </Link>
              )}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Current Winner
          </h2>
          {currentWinner ? (
            <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Winning Proposal</p>
                  <p className="font-semibold">
                    #{currentWinner.winningProposalId}
                  </p>
                </div>
              </div>
              <p className="text-lg mb-4">{currentWinner.proposalInfo}</p>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{currentWinner.winningVotes} votes</span>
                <span>{formatDate(currentWinner.declaredAt)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No winner has been declared yet</p>
              <p className="text-sm mt-2">
                Vote on proposals to help decide the winner
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
