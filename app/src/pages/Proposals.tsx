import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Plus,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useProposals, useVote, useIsVoterRegistered } from "../hooks/useProgram";
import {
  ProposalCard,
  EmptyState,
  LoadingSkeleton,
  CountdownTimer,
  AnimatedButton,
} from "../components/ui";
import { useState } from "react";
import { formatDate } from "../lib/utils";
import toast from "react-hot-toast";

export function Proposals() {
  const { connected } = useWallet();
  const { data: proposals, isLoading } = useProposals();
  const { data: isVoterRegistered } = useIsVoterRegistered();
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProposals = proposals?.filter((p) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && p.status === "active") ||
      (filter === "ended" && p.status === "ended");
    const matchesSearch =
      !searchQuery ||
      p.proposalInfo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeCount = proposals?.filter((p) => p.status === "active").length || 0;
  const endedCount = proposals?.filter((p) => p.status === "ended").length || 0;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={AlertCircle}
          title="Connect Your Wallet"
          description="Please connect your wallet to view and vote on proposals"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
            Proposals
          </h1>
          <p className="text-white/60">
            Browse and vote on community governance proposals
          </p>
        </div>
        <Link to="/create">
          <AnimatedButton icon={<Plus className="w-5 h-5" />}>Create Proposal</AnimatedButton>
        </Link>
      </motion.div>

      {/* Registration Alert */}
      {!isVoterRegistered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-yellow-500/20 bg-yellow-500/5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-400 mb-1">
                Registration Required
              </h3>
              <p className="text-white/60 text-sm mb-4">
                You need to register as a voter before you can vote on proposals.
                Registration is free and only takes a moment.
              </p>
              <Link to="/profile">
                <AnimatedButton variant="secondary" size="sm">
                  Register Now
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {[
              { key: "all", label: "All", count: proposals?.length || 0 },
              { key: "active", label: "Active", count: activeCount },
              { key: "ended", label: "Ended", count: endedCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === tab.key
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs text-white/40">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
      </motion.div>

      {/* Proposals List */}
      {isLoading ? (
        <LoadingSkeleton type="list" count={5} />
      ) : filteredProposals?.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No Proposals Found"
          description={
            searchQuery
              ? "No proposals match your search criteria"
              : "There are no proposals in this category yet"
          }
          actionLabel={!searchQuery ? "Create Proposal" : undefined}
          actionHref="/create"
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {filteredProposals?.map((proposal, index) => (
              <ProposalCard
                key={proposal.proposalId}
                proposalId={proposal.proposalId}
                proposalInfo={proposal.proposalInfo}
                deadline={proposal.deadline}
                numberOfVotes={proposal.numberOfVotes}
                status={proposal.status}
                index={index}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={AlertCircle}
          title="Connect Your Wallet"
          description="Connect your wallet to view this proposal"
        />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={AlertCircle}
          title="Proposal Not Found"
          description="This proposal does not exist or has been removed"
          actionLabel="View All Proposals"
          actionHref="/proposals"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Link
          to="/proposals"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Proposals
        </Link>
      </motion.div>

      {/* Proposal Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 relative overflow-hidden"
      >
        <div
          className={`absolute top-0 left-0 w-full h-1 ${
            isExpired
              ? "bg-gradient-to-r from-gray-500 to-gray-400"
              : "bg-gradient-to-r from-purple-500 to-green-500"
          }`}
        />

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-mono text-white/40">
                #{proposal.proposalId.toString().padStart(3, "0")}
              </span>
              {isExpired ? (
                <span className="badge badge-ended">
                  <CheckCircle2 className="w-3 h-3" />
                  Ended
                </span>
              ) : (
                <span className="badge badge-active">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Active
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{proposal.proposalInfo}</h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-white/50 mb-1">Total Votes</p>
            <p className="text-2xl font-bold">{proposal.numberOfVotes}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-white/50 mb-1">Status</p>
            <p className={`text-lg font-semibold ${isExpired ? "text-gray-400" : "text-green-400"}`}>
              {isExpired ? "Ended" : "Active"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-white/50 mb-1">Deadline</p>
            <p className="text-sm font-medium">{formatDate(proposal.deadline)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-white/50 mb-1">Time Remaining</p>
            <div className="text-sm font-medium">
              <CountdownTimer deadline={proposal.deadline} compact />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Voting Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-8"
      >
        <h2 className="text-xl font-semibold mb-6">Cast Your Vote</h2>

        {!isVoterRegistered ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-white/60 mb-4">
              You need to register as a voter before voting
            </p>
            <Link to="/profile">
              <AnimatedButton>Register to Vote</AnimatedButton>
            </Link>
          </div>
        ) : isExpired ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-500/20 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-white/60">Voting has ended for this proposal</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-white/80">
                Voting requires staking <span className="font-semibold text-purple-400">1 token</span>.
                Your tokens will be transferred to the treasury to support the DAO.
              </p>
            </div>
            <AnimatedButton
              onClick={handleVote}
              loading={voteMutation.isPending}
              className="w-full justify-center text-lg py-4"
            >
              Vote for This Proposal
            </AnimatedButton>
            <p className="text-xs text-white/40 text-center">
              By voting, you agree to transfer 1 VKN token to the treasury
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
