import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { User, Wallet, Vote, CheckCircle } from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  useSolBalance,
  useIsVoterRegistered,
  useProposals,
} from "../hooks/useProgram";
import { useRegisterVoter } from "../hooks/useProgram";
import { formatAddress } from "../lib/utils";

export function Profile() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { data: solBalance } = useSolBalance();
  const { data: isVoterRegistered, isLoading: voterLoading } =
    useIsVoterRegistered();
  const { data: proposals } = useProposals();
  const registerMutation = useRegisterVoter();

  const handleRegister = () => {
    registerMutation.mutate();
  };

  if (!connected) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-12 rounded-3xl"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-green-500/20 flex items-center justify-center">
            <User className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
          <p className="text-gray-400 mb-8">
            Connect your wallet to view your profile and voting history
          </p>
          <button
            onClick={() => setVisible(true)}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-green-600 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Connect Wallet
          </button>
        </motion.div>
      </div>
    );
  }

  const userProposals =
    proposals?.filter(
      (p) => publicKey && p.authority.toString() === publicKey.toString()
    ) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Your Profile</h1>
              <p className="text-gray-400 font-mono mt-1">
                {publicKey ? formatAddress(publicKey.toString()) : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
          >
            Disconnect
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="p-6 rounded-xl bg-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">SOL Balance</span>
            </div>
            <p className="text-2xl font-bold">
              {solBalance?.toFixed(4) || "0.0000"} SOL
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400">Voter Status</span>
            </div>
            {voterLoading ? (
              <p className="text-2xl font-bold">Loading...</p>
            ) : isVoterRegistered ? (
              <p className="text-2xl font-bold text-green-400">Registered</p>
            ) : (
              <p className="text-2xl font-bold text-yellow-400">
                Not Registered
              </p>
            )}
          </div>
        </div>

        {!isVoterRegistered && (
          <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-green-500/10 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Vote className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Register as a Voter</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Register to participate in governance and vote on proposals.
                  This is a one-time registration.
                </p>
                <button
                  onClick={handleRegister}
                  disabled={registerMutation.isPending}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-green-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {registerMutation.isPending
                    ? "Registering..."
                    : "Register Now"}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-8"
      >
        <h2 className="text-xl font-semibold mb-6">Your Proposals</h2>
        {userProposals.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Vote className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>You haven't created any proposals yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userProposals.map((proposal) => (
              <div
                key={proposal.proposalId}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">
                      #{proposal.proposalId}
                    </span>
                    <p className="font-medium mt-1">{proposal.proposalInfo}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        proposal.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {proposal.status}
                    </span>
                    <p className="text-sm text-gray-400 mt-2">
                      {proposal.numberOfVotes} votes
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
