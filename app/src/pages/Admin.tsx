import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import {
  Settings,
  Trophy,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import {
  useTreasuryConfig,
  useProposals,
  useCurrentWinner,
  useInitializeTreasury,
  usePickWinner,
  useWithdrawSol,
} from "../hooks/useProgram";
import { useState } from "react";
import { EmptyState, AnimatedButton, LoadingSkeleton } from "../components/ui";

export function Admin() {
  const { connected } = useWallet();
  const { data: treasuryConfig } = useTreasuryConfig();
  const { data: proposals, isLoading } = useProposals();
  const { data: currentWinner } = useCurrentWinner();
  const initializeMutation = useInitializeTreasury();
  const pickWinnerMutation = usePickWinner();
  const withdrawMutation = useWithdrawSol();

  const [initForm, setInitForm] = useState({
    solPrice: "10000000",
    tokensPerPurchase: "1000",
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const endedProposals = proposals?.filter((p) => p.status === "ended") || [];
  const activeProposals = proposals?.filter((p) => p.status === "active") || [];

  const handleInitialize = () => {
    initializeMutation.mutate({
      solPrice: parseInt(initForm.solPrice),
      tokensPerPurchase: parseInt(initForm.tokensPerPurchase),
    });
  };

  const handlePickWinner = (proposalId: number) => {
    pickWinnerMutation.mutate(proposalId);
  };

  const handleWithdraw = () => {
    const lamports = Math.floor(parseFloat(withdrawAmount) * 1000000000);
    if (lamports > 0) {
      withdrawMutation.mutate(lamports);
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={AlertCircle}
          title="Connect Your Wallet"
          description="Connect your wallet to access admin features"
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
      >
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
          Admin Dashboard
        </h1>
        <p className="text-white/60">
          Manage treasury, pick winners, and oversee governance
        </p>
      </motion.div>

      {/* Initialize Treasury */}
      {!treasuryConfig && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Initialize Treasury</h2>
              <p className="text-white/60">
                Set up the DAO treasury for the first time
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                SOL Price (Lamports)
              </label>
              <input
                type="number"
                value={initForm.solPrice}
                onChange={(e) =>
                  setInitForm({ ...initForm, solPrice: e.target.value })
                }
                className="input-field"
              />
              <p className="text-xs text-white/40 mt-1">
                Price in lamports (1 SOL = 1,000,000,000 lamports)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Tokens Per Purchase
              </label>
              <input
                type="number"
                value={initForm.tokensPerPurchase}
                onChange={(e) =>
                  setInitForm({
                    ...initForm,
                    tokensPerPurchase: e.target.value,
                  })
                }
                className="input-field"
              />
              <p className="text-xs text-white/40 mt-1">
                Number of tokens given per purchase
              </p>
            </div>
          </div>

          <AnimatedButton
            onClick={handleInitialize}
            loading={initializeMutation.isPending}
            className="w-full justify-center"
          >
            Initialize Treasury
          </AnimatedButton>
        </motion.div>
      )}

      {/* Treasury Stats */}
      {treasuryConfig && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-white/50">SOL Price</span>
                </div>
                <p className="text-2xl font-bold">
                  {treasuryConfig.solPrice / 1000000000} SOL
                </p>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-white/50">Tokens/Purchase</span>
                </div>
                <p className="text-2xl font-bold">
                  {treasuryConfig.tokensPerPurchase} VKN
                </p>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-white/50">Total Proposals</span>
                </div>
                <p className="text-2xl font-bold">{proposals?.length || 0}</p>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-white/50">Active</span>
                </div>
                <p className="text-2xl font-bold">{activeProposals.length}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pick Winner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Pick Winner</h2>
                  <p className="text-white/60">
                    Select a winner from ended proposals
                  </p>
                </div>
              </div>

              {isLoading ? (
                <LoadingSkeleton type="list" count={3} />
              ) : endedProposals.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-white/10" />
                  <p className="text-white/60">No ended proposals to pick from</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {endedProposals.map((proposal) => (
                    <motion.button
                      key={proposal.proposalId}
                      onClick={() => handlePickWinner(proposal.proposalId)}
                      disabled={pickWinnerMutation.isPending}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            #{proposal.proposalId.toString().padStart(3, "0")}
                          </p>
                          <p className="text-sm text-white/50 truncate max-w-[200px]">
                            {proposal.proposalInfo}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-purple-400">
                            {proposal.numberOfVotes} votes
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Withdraw SOL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Withdraw SOL</h2>
                  <p className="text-white/60">
                    Withdraw SOL from treasury to your wallet
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount (SOL)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className="input-field pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-medium">
                      SOL
                    </span>
                  </div>
                </div>
                <AnimatedButton
                  onClick={handleWithdraw}
                  loading={withdrawMutation.isPending}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className="w-full justify-center"
                  variant="secondary"
                >
                  Withdraw SOL
                </AnimatedButton>
              </div>
            </motion.div>
          </div>

          {/* Current Winner */}
          {currentWinner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6 border-yellow-500/20"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Current Winner</h2>
                  <p className="text-white/60">
                    The most recently declared winner
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="font-semibold text-lg mb-2">
                  #{currentWinner.winningProposalId.toString().padStart(3, "0")}:{" "}
                  {currentWinner.proposalInfo}
                </p>
                <p className="text-white/60">
                  {currentWinner.winningVotes} votes • Declared on{" "}
                  {new Date(currentWinner.declaredAt * 1000).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
