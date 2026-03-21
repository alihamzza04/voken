import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { Clock, Coins, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useCreateProposal, useTreasuryConfig } from "../hooks/useProgram";
import { EmptyState, AnimatedButton } from "../components/ui";

export function CreateProposal() {
  const { connected } = useWallet();
  const { data: treasuryConfig } = useTreasuryConfig();
  const createProposalMutation = useCreateProposal();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    proposalInfo: "",
    deadlineDays: "7",
    tokenAmount: "100",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proposalInfo.trim()) return;

    const deadline =
      Math.floor(Date.now() / 1000) + parseInt(formData.deadlineDays) * 86400;
    const tokenAmount = parseInt(formData.tokenAmount);

    createProposalMutation.mutate(
      {
        proposalInfo: formData.proposalInfo,
        deadline,
        tokenAmount,
      },
      {
        onSuccess: () => {
          setStep(3); // Success step
        },
      }
    );
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={AlertCircle}
          title="Connect Your Wallet"
          description="Connect your wallet to create a proposal"
        />
      </div>
    );
  }

  if (!treasuryConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={AlertCircle}
          title="Treasury Not Initialized"
          description="The DAO treasury must be initialized before creating proposals"
          actionLabel="Go to Admin"
          actionHref="/admin"
        />
      </div>
    );
  }

  // Success State
  if (step === 3) {
    return (
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Proposal Created!</h2>
          <p className="text-white/60 mb-8">
            Your proposal has been submitted successfully and is now open for voting.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/proposals" className="btn-secondary">
              View Proposals
            </a>
            <a href="/" className="btn-gradient">
              Go to Dashboard
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
          Create Proposal
        </h1>
        <p className="text-white/60">
          Submit a new proposal for community voting
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 mb-8"
      >
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= s
                  ? "bg-gradient-to-r from-purple-500 to-green-500 text-white"
                  : "bg-white/10 text-white/40"
              }`}
            >
              {s}
            </div>
            <span
              className={`text-sm font-medium ${
                step >= s ? "text-white" : "text-white/40"
              }`}
            >
              {s === 1 ? "Details" : "Review"}
            </span>
            {s === 1 && <ArrowRight className="w-4 h-4 text-white/20" />}
          </div>
        ))}
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-8"
      >
        {step === 1 ? (
          <form className="space-y-6">
            {/* Proposal Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Proposal Description
              </label>
              <textarea
                value={formData.proposalInfo}
                onChange={(e) =>
                  setFormData({ ...formData, proposalInfo: e.target.value })
                }
                placeholder="Describe your proposal in detail..."
                className="input-field h-40 resize-none"
                required
              />
              <p className="text-xs text-white/40 mt-2">
                {formData.proposalInfo.length}/500 characters
              </p>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/40" />
                Voting Duration
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {["3", "5", "7", "14", "30"].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setFormData({ ...formData, deadlineDays: days })}
                    className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                      formData.deadlineDays === days
                        ? "bg-gradient-to-r from-purple-500 to-green-500 text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            {/* Token Amount */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Coins className="w-4 h-4 text-white/40" />
                Stake Amount (Tokens)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.tokenAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, tokenAmount: e.target.value })
                  }
                  min="1"
                  className="input-field pr-16"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-medium">
                  VKN
                </span>
              </div>
              <p className="text-xs text-white/40 mt-2">
                Minimum stake required to create a proposal
              </p>
            </div>

            {/* Next Button */}
            <AnimatedButton
              onClick={() => setStep(2)}
              disabled={!formData.proposalInfo.trim()}
              className="w-full justify-center"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </AnimatedButton>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Review */}
            <h3 className="font-semibold text-lg mb-4">Review Your Proposal</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-white/50 mb-1">Description</p>
                <p className="font-medium">{formData.proposalInfo}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-white/50 mb-1">Duration</p>
                  <p className="font-medium">{formData.deadlineDays} days</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-white/50 mb-1">Stake</p>
                  <p className="font-medium">{formData.tokenAmount} VKN</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-400 mb-1">Important</p>
                  <ul className="text-sm text-white/60 space-y-1">
                    <li>• {formData.tokenAmount} tokens will be staked to create this proposal</li>
                    <li>• Tokens will be locked until voting ends</li>
                    <li>• You can close the proposal after the deadline to recover rent</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <AnimatedButton
                onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                loading={createProposalMutation.isPending}
                className="flex-1 justify-center"
              >
                Create Proposal
              </AnimatedButton>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
