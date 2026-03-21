import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Vote,
  Users,
  Clock,
  Trophy,
  ArrowRight,
  Wallet,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useProposals, useCurrentWinner, useIsVoterRegistered } from "../hooks/useProgram";
import { StatCard, ProposalCard, EmptyState, LoadingSkeleton } from "../components/ui";
import { AnimatedButton } from "../components/ui/AnimatedButton";

export function Dashboard() {
  const { connected } = useWallet();
  const { data: proposals, isLoading: proposalsLoading } = useProposals();
  const { data: currentWinner } = useCurrentWinner();
  const { data: isVoterRegistered, isLoading: voterLoading } = useIsVoterRegistered();

  const activeProposals = proposals?.filter((p) => p.status === "active") || [];
  const totalVotes = proposals?.reduce((sum, p) => sum + p.numberOfVotes, 0) || 0;

  // Not connected state
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center max-w-xl"
        >
          {/* Hero Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-purple-500/20 to-green-500/20 flex items-center justify-center border border-white/10"
          >
            <Vote className="w-12 h-12 text-purple-400" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl font-bold mb-6"
          >
            <span className="gradient-text">Voken DAO</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/60 mb-8 leading-relaxed"
          >
            Participate in decentralized governance, vote on community proposals,
            and help shape the future of the ecosystem.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {[
              { icon: Wallet, label: "Buy Tokens" },
              { icon: Vote, label: "Cast Votes" },
              { icon: Trophy, label: "Win Rewards" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <feature.icon className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <span className="text-sm text-white/60">{feature.label}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-white/40">
              Connect your Solana wallet to get started
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 relative overflow-hidden"
      >
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-white/60">Welcome back</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="gradient-text">DAO Dashboard</span>
            </h1>
            <p className="text-white/60">
              {isVoterRegistered
                ? "You are registered as a voter and ready to participate"
                : "Complete your registration to start voting on proposals"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {!isVoterRegistered && !voterLoading && (
              <AnimatedButton
                onClick={() => window.location.href = "/profile"}
                icon={<Users className="w-4 h-4" />}
              >
                Register to Vote
              </AnimatedButton>
            )}
            <Link to="/proposals">
              <AnimatedButton
                variant="secondary"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View Proposals
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      {proposalsLoading ? (
        <LoadingSkeleton type="stat" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Proposals"
            value={proposals?.length || 0}
            icon={Vote}
            iconColor="purple"
            delay={0.1}
          />
          <StatCard
            title="Active Proposals"
            value={activeProposals.length}
            icon={TrendingUp}
            iconColor="green"
            delay={0.2}
          />
          <StatCard
            title="Total Votes Cast"
            value={totalVotes}
            icon={Users}
            iconColor="blue"
            delay={0.3}
          />
          <StatCard
            title="Winner Declared"
            value={currentWinner ? "Yes" : "No"}
            icon={Trophy}
            iconColor="yellow"
            delay={0.4}
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Proposals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Active Proposals
            </h2>
            <Link
              to="/proposals"
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {proposalsLoading ? (
            <LoadingSkeleton type="list" count={3} />
          ) : activeProposals.length === 0 ? (
            <EmptyState
              icon={Vote}
              title="No Active Proposals"
              description="There are currently no active proposals. Check back later or create your own!"
              actionLabel="Create Proposal"
              actionHref="/create"
            />
          ) : (
            <div className="space-y-4">
              {activeProposals.slice(0, 5).map((proposal, index) => (
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
              {activeProposals.length > 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center pt-4"
                >
                  <Link
                    to="/proposals"
                    className="text-sm text-white/40 hover:text-white/60 transition-colors"
                  >
                    +{activeProposals.length - 5} more proposals
                  </Link>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {/* Current Winner */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Current Winner
            </h2>
            
            {currentWinner ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 relative overflow-hidden"
              >
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Winning Proposal</p>
                      <p className="font-bold text-lg">
                        #{currentWinner.winningProposalId.toString().padStart(3, "0")}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-white/80 mb-4 line-clamp-2">
                    {currentWinner.proposalInfo}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">
                      <span className="font-semibold text-white">{currentWinner.winningVotes}</span> votes
                    </span>
                    <span className="text-white/40">
                      {new Date(currentWinner.declaredAt * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-white/10" />
                <p className="text-white/60 mb-2">No winner declared yet</p>
                <p className="text-sm text-white/40">
                  Vote on proposals to help decide the winner
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/create">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Vote className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Create Proposal</p>
                    <p className="text-sm text-white/50">Submit a new idea</p>
                  </div>
                </div>
              </Link>
              <Link to="/buy-tokens">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wallet className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Buy Tokens</p>
                    <p className="text-sm text-white/50">Get VKN with SOL</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
