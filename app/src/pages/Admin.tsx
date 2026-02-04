import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { Settings, Trophy, DollarSign } from "lucide-react";
import {
  useTreasuryConfig,
  useProposals,
  useCurrentWinner,
  useInitializeTreasury,
  usePickWinner,
  useWithdrawSol,
} from "../hooks/useProgram";
import { useState } from "react";
import { connection } from "../utils/connection";

export function Admin() {
  const { connected } = useWallet();
  const { data: treasuryConfig } = useTreasuryConfig();
  const { data: proposals } = useProposals();
  const { data: currentWinner } = useCurrentWinner();
  const initializeMutation = useInitializeTreasury();
  const pickWinnerMutation = usePickWinner();
  const withdrawMutation = useWithdrawSol();

  const [initForm, setInitForm] = useState({
    solPrice: "10000000",
    tokensPerPurchase: "1000",
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [debugInfo, setDebugInfo] = useState<string>("");

  const endedProposals = proposals?.filter((p) => p.status === "ended") || [];

  const checkConnection = async () => {
    try {
      const slot = await connection.getSlot();
      setDebugInfo(`Connected!\nSlot: ${slot}`);
    } catch (err: any) {
      setDebugInfo(`Connection Error: ${err.message}`);
    }
  };

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
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-gray-400">
          Connect your wallet to access admin features
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          Manage treasury, pick winners, and oversee governance
        </p>
      </motion.div>

      {!treasuryConfig && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Initialize Treasury</h2>
              <p className="text-gray-400">
                Set up the DAO treasury for the first time
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
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
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none"
              />
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
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleInitialize}
            disabled={initializeMutation.isPending}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-green-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {initializeMutation.isPending
              ? "Initializing..."
              : "Initialize Treasury"}
          </button>
        </motion.div>
      )}

      {treasuryConfig && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              Treasury Configuration
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-gray-400">SOL Price</p>
                <p className="text-lg font-semibold">
                  {treasuryConfig.solPrice} lamports
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-gray-400">Tokens Per Purchase</p>
                <p className="text-lg font-semibold">
                  {treasuryConfig.tokensPerPurchase} VKN
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Pick Winner</h2>
                  <p className="text-gray-400">
                    Select a winner from ended proposals
                  </p>
                </div>
              </div>

              {endedProposals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No ended proposals to pick from</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {endedProposals.map((proposal) => (
                    <button
                      key={proposal.proposalId}
                      onClick={() => handlePickWinner(proposal.proposalId)}
                      disabled={pickWinnerMutation.isPending}
                      className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">#{proposal.proposalId}</p>
                          <p className="text-sm text-gray-400 truncate">
                            {proposal.proposalInfo}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {proposal.numberOfVotes} votes
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Withdraw SOL</h2>
                  <p className="text-gray-400">
                    Withdraw SOL from treasury to your wallet
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Amount in SOL"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-green-500 focus:outline-none"
                />
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending || !withdrawAmount}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {withdrawMutation.isPending
                    ? "Withdrawing..."
                    : "Withdraw SOL"}
                </button>
              </div>
            </motion.div>
          </div>

          {currentWinner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-6 border-yellow-500/30"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Current Winner</h2>
                  <p className="text-gray-400">
                    The most recently declared winner
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-yellow-500/10">
                <p className="font-semibold">
                  #{currentWinner.winningProposalId}:{" "}
                  {currentWinner.proposalInfo}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {currentWinner.winningVotes} votes declared on
                </p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
