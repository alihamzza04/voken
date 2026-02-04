import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { Plus, Clock, Coins } from "lucide-react";
import { useCreateProposal } from "../hooks/useProgram";
import { useTreasuryConfig } from "../hooks/useProgram";

export function CreateProposal() {
  const { connected } = useWallet();
  const { data: treasuryConfig } = useTreasuryConfig();
  const createProposalMutation = useCreateProposal();
  const [formData, setFormData] = useState({
    proposalInfo: "",
    deadlineDays: "7",
    tokenAmount: "100",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proposalInfo.trim()) {
      return;
    }

    const deadline =
      Math.floor(Date.now() / 1000) + parseInt(formData.deadlineDays) * 86400;
    const tokenAmount = parseInt(formData.tokenAmount);

    createProposalMutation.mutate({
      proposalInfo: formData.proposalInfo,
      deadline,
      tokenAmount,
    });
  };

  if (!connected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-gray-400">
          Connect your wallet to create a proposal
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Plus className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create Proposal</h1>
            <p className="text-gray-400">
              Submit a new proposal for community voting
            </p>
          </div>
        </div>

        {!treasuryConfig ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              Treasury must be initialized before creating proposals
            </p>
            <a href="/admin" className="text-purple-400 hover:text-purple-300">
              Go to Admin Dashboard →
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Proposal Description
              </label>
              <textarea
                value={formData.proposalInfo}
                onChange={(e) =>
                  setFormData({ ...formData, proposalInfo: e.target.value })
                }
                placeholder="Describe your proposal..."
                className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Voting Duration (Days)
                </label>
                <select
                  value={formData.deadlineDays}
                  onChange={(e) =>
                    setFormData({ ...formData, deadlineDays: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none"
                >
                  <option value="3">3 days</option>
                  <option value="5">5 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-gray-400" />
                  Stake Amount (Tokens)
                </label>
                <input
                  type="number"
                  value={formData.tokenAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, tokenAmount: e.target.value })
                  }
                  min="1"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-sm text-gray-400 mb-2">Requirements</p>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>
                  • You must stake {formData.tokenAmount} tokens to create this
                  proposal
                </li>
                <li>• Tokens will be locked until voting ends</li>
                <li>
                  • You can close the proposal after the deadline to recover
                  rent
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={
                createProposalMutation.isPending ||
                !formData.proposalInfo.trim()
              }
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-green-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createProposalMutation.isPending
                ? "Creating..."
                : "Create Proposal"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
