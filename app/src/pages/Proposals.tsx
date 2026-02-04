import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Users, Calendar, ChevronRight } from "lucide-react";
import { useProposals, useVote } from "../hooks/useProgram";
import { useIsVoterRegistered } from "../hooks/useProgram";
import { getTimeRemaining, formatDate } from "../lib/utils";
import toast from "react-hot-toast";

export function Proposals() {
  const { connected } = useWallet();
  const { data: proposals, isLoading } = useProposals();
  const { data: isVoterRegistered } = useIsVoterRegistered();

  const activeProposals = proposals?.filter((p) => p.status === "active") || [];
  const endedProposals = proposals?.filter((p) => p.status === "ended") || [];

  if (!connected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-gray-400">
          Connect your wallet to view and vote on proposals
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            Proposals
          </h1>
          <p className="text-gray-400 mt-2">
            Browse and vote on community proposals
          </p>
        </div>
        <Link
          to="/create"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-green-600 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Create Proposal
        </Link>
      </motion.div>

      {!isVoterRegistered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl border-yellow-500/30 bg-yellow-500/5"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400">
                Registration Required
              </h3>
              <p className="text-gray-400 mt-1">
                You need to register as a voter before you can vote on
                proposals.
              </p>
              <Link
                to="/profile"
                className="inline-block mt-3 text-sm text-yellow-400 hover:text-yellow-300"
              >
                Register now →
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Active Proposals ({activeProposals.length})
          </h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : activeProposals.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center">
              <p className="text-gray-400">No active proposals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeProposals.map((proposal, index) => (
                <motion.div
                  key={proposal.proposalId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/proposals/${proposal.proposalId}`}
                    className="glass-card p-6 rounded-2xl hover:bg-white/10 transition-colors block"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-gray-500">
                            #{proposal.proposalId}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                            Active
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-3">
                          {proposal.proposalInfo}
                        </h3>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {proposal.numberOfVotes} votes
                          </span>
                          <span className="flex items-center gap-1 text-green-400">
                            <Clock className="w-4 h-4" />
                            {getTimeRemaining(proposal.deadline)} left
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-500" />
            Ended Proposals ({endedProposals.length})
          </h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : endedProposals.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center">
              <p className="text-gray-400">No ended proposals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {endedProposals.map((proposal, index) => (
                <motion.div
                  key={proposal.proposalId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/proposals/${proposal.proposalId}`}
                    className="glass-card p-6 rounded-2xl hover:bg-white/10 transition-colors block opacity-60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-gray-500">
                            #{proposal.proposalId}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/20 text-gray-400">
                            Ended
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-3">
                          {proposal.proposalInfo}
                        </h3>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {proposal.numberOfVotes} votes
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Ended {formatDate(proposal.deadline)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function ProposalDetail() {
  const { id } = useParams();
  const { connected } = useWallet();
  const proposalId = parseInt(id || "0");
  const { data: proposals, isLoading } = useProposals();
  const { data: isVoterRegistered } = useIsVoterRegistered();
  const voteMutation = useVote();

  const proposal = proposals?.find((p) => p.proposalId === proposalId);
  const isExpired = proposal && Date.now() / 1000 > proposal.deadline;

  const handleVote = async () => {
    if (!isVoterRegistered) {
      toast.error("Please register as a voter first");
      return;
    }
    if (isExpired) {
      toast.error("Voting has ended for this proposal");
      return;
    }
    voteMutation.mutate({ proposalId, tokenAmount: 1 });
  };

  if (!connected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-gray-400">
          Connect your wallet to view this proposal
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Proposal Not Found</h1>
        <p className="text-gray-400">This proposal does not exist</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          to="/proposals"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Proposals
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-8"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-500">
                #{proposal.proposalId}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  isExpired
                    ? "bg-gray-500/20 text-gray-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {isExpired ? "Ended" : "Active"}
              </span>
            </div>
            <h1 className="text-2xl font-bold">{proposal.proposalInfo}</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-gray-400 mb-1">Total Votes</p>
            <p className="text-2xl font-bold">{proposal.numberOfVotes}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-gray-400 mb-1">Time Remaining</p>
            <p
              className={`text-2xl font-bold ${
                isExpired ? "text-red-400" : "text-green-400"
              }`}
            >
              {getTimeRemaining(proposal.deadline)}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-sm text-gray-400 mb-2">Deadline</p>
          <p className="text-lg">{formatDate(proposal.deadline)}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-8"
      >
        <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
        {!isVoterRegistered ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              You need to register as a voter before voting
            </p>
            <Link
              to="/profile"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-green-600 text-white font-semibold"
            >
              Register to Vote
            </Link>
          </div>
        ) : isExpired ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Voting has ended for this proposal</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400">
              Voting requires staking 1 token. Your tokens will be transferred
              to the treasury.
            </p>
            <button
              onClick={handleVote}
              disabled={voteMutation.isPending}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-green-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {voteMutation.isPending ? "Voting..." : "Vote for This Proposal"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
