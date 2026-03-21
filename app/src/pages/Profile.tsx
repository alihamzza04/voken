import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import {
  User,
  Wallet,
  Vote,
  CheckCircle2,
  LogOut,
  Copy,
  FileText,
} from "lucide-react";
import {
  useSolBalance,
  useIsVoterRegistered,
  useProposals,
  useRegisterVoter,
} from "../hooks/useProgram";
import { formatAddress } from "../lib/utils";
import { AnimatedButton } from "../components/ui";
import { useState } from "react";
import toast from "react-hot-toast";

export function Profile() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { data: solBalance } = useSolBalance();
  const { data: isVoterRegistered, isLoading: voterLoading } =
    useIsVoterRegistered();
  const { data: proposals } = useProposals();
  const registerMutation = useRegisterVoter();
  const [copied, setCopied] = useState(false);

  const handleRegister = () => {
    registerMutation.mutate();
  };

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      toast.success("Address copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const userProposals =
    proposals?.filter(
      (p) => publicKey && p.authority.toString() === publicKey.toString()
    ) || [];

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-purple-500/20 to-green-500/20 flex items-center justify-center border border-white/10"
          >
            <User className="w-12 h-12 text-purple-400" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
          <p className="text-white/60 mb-8">
            Connect your wallet to view your profile, voting history, and manage
            your account
          </p>

          <AnimatedButton
            onClick={() => setVisible(true)}
            icon={<Wallet className="w-5 h-5" />}
          >
            Connect Wallet
          </AnimatedButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center shadow-lg shadow-purple-500/20"
            >
              <User className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Your Profile</h1>
              <div className="flex items-center gap-2">
                <code className="text-sm text-white/50 font-mono bg-white/5 px-3 py-1 rounded-lg">
                  {publicKey ? formatAddress(publicKey.toString()) : ""}
                </code>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopyAddress}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/50" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => disconnect()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-green-400" />
              <span className="text-sm text-white/50">SOL Balance</span>
            </div>
            <p className="text-2xl font-bold font-mono">
              {solBalance?.toFixed(4) || "0.0000"}
              <span className="text-sm font-normal text-white/50 ml-1">SOL</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2
                className={`w-5 h-5 ${
                  isVoterRegistered ? "text-green-400" : "text-yellow-400"
                }`}
              />
              <span className="text-sm text-white/50">Voter Status</span>
            </div>
            {voterLoading ? (
              <div className="skeleton h-8 w-24 rounded" />
            ) : (
              <p
                className={`text-2xl font-bold ${
                  isVoterRegistered ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {isVoterRegistered ? "Registered" : "Not Registered"}
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-white/50">Your Proposals</span>
            </div>
            <p className="text-2xl font-bold">{userProposals.length}</p>
          </div>
        </div>

        {/* Registration CTA */}
        {!isVoterRegistered && !voterLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-green-500/10 border border-white/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Vote className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Register as a Voter</h3>
                  <p className="text-sm text-white/50">
                    Register to participate in governance and vote on proposals.
                    This is a one-time registration.
                  </p>
                </div>
              </div>
              <AnimatedButton
                onClick={handleRegister}
                loading={registerMutation.isPending}
                className="flex-shrink-0"
              >
                Register Now
              </AnimatedButton>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Your Proposals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold">Your Proposals</h2>
        </div>

        {userProposals.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-white/10" />
            <p className="text-white/60 mb-2">No proposals yet</p>
            <p className="text-sm text-white/40 mb-6">
              Create your first proposal to get started
            </p>
            <a href="/create" className="btn-gradient inline-flex items-center gap-2">
              <Vote className="w-4 h-4" />
              Create Proposal
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {userProposals.map((proposal) => (
              <motion.div
                key={proposal.proposalId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white/40 font-mono">
                      #{proposal.proposalId.toString().padStart(3, "0")}
                    </span>
                    <p className="font-medium mt-1">{proposal.proposalInfo}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`badge ${
                        proposal.status === "active"
                          ? "badge-active"
                          : "badge-ended"
                      }`}
                    >
                      {proposal.status}
                    </span>
                    <p className="text-sm text-white/40 mt-2">
                      {proposal.numberOfVotes} votes
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
