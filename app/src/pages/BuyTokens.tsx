import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { Wallet, Coins, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  useTreasuryConfig,
  useSolBalance,
  useBuyTokens,
} from "../hooks/useProgram";
import { useState, useMemo } from "react";
import { EmptyState, AnimatedButton } from "../components/ui";

export function BuyTokens() {
  const { connected } = useWallet();
  const { data: treasuryConfig } = useTreasuryConfig();
  const { data: solBalance } = useSolBalance();
  const buyTokensMutation = useBuyTokens();

  const [solAmount, setSolAmount] = useState("1");
  const [showSuccess, setShowSuccess] = useState(false);

  const tokenAmount = useMemo(() => {
    if (!treasuryConfig || !solAmount) return 0;
    const sol = parseFloat(solAmount);
    if (isNaN(sol) || sol <= 0) return 0;
    return (sol * treasuryConfig.tokensPerPurchase) / treasuryConfig.solPrice;
  }, [solAmount, treasuryConfig]);

  const handleBuy = async () => {
    buyTokensMutation.mutate(undefined, {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      },
    });
  };

  const solPriceInSol = treasuryConfig
    ? treasuryConfig.solPrice / 1000000000
    : 0;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={AlertCircle}
          title="Connect Your Wallet"
          description="Connect your wallet to buy tokens"
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
          description="The DAO treasury must be initialized before buying tokens"
          actionLabel="Go to Admin"
          actionHref="/admin"
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center"
        >
          <Coins className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
          Buy Voken Tokens
        </h1>
        <p className="text-white/60">
          Exchange SOL for VKN governance tokens
        </p>
      </motion.div>

      {/* Exchange Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8"
      >
        {/* Rate Info */}
        <div className="p-4 rounded-xl bg-white/5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/50">Exchange Rate</span>
            <span className="font-semibold">
              {treasuryConfig.tokensPerPurchase} VKN = {solPriceInSol} SOL
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">Your Balance</span>
            <span className="font-semibold font-mono">
              {solBalance?.toFixed(4) || "0.0000"} SOL
            </span>
          </div>
        </div>

        {/* Exchange Inputs */}
        <div className="space-y-4 mb-8">
          {/* SOL Input */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-white/70">
              You Pay
            </label>
            <div className="relative">
              <input
                type="number"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
                min="0.001"
                step="0.001"
                placeholder="0.00"
                className="input-field pr-24 text-2xl font-semibold"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
                <span className="font-semibold">SOL</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center -my-2 relative z-10">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center shadow-lg"
            >
              <ArrowRight className="w-5 h-5 text-white rotate-90" />
            </motion.div>
          </div>

          {/* VKN Input */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-white/70">
              You Receive
            </label>
            <div className="relative">
              <input
                type="text"
                value={tokenAmount.toLocaleString()}
                readOnly
                className="input-field pr-24 text-2xl font-semibold text-green-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500" />
                <span className="font-semibold text-green-400">VKN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">
              Tokens purchased successfully!
            </span>
          </motion.div>
        )}

        {/* Buy Button */}
        <AnimatedButton
          onClick={handleBuy}
          loading={buyTokensMutation.isPending}
          disabled={
            !solAmount ||
            parseFloat(solAmount) <= 0 ||
            parseFloat(solAmount) > (solBalance || 0)
          }
          className="w-full justify-center text-lg py-4"
          icon={!buyTokensMutation.isPending && <Wallet className="w-5 h-5" />}
        >
          {buyTokensMutation.isPending
            ? "Processing..."
            : parseFloat(solAmount) > (solBalance || 0)
            ? "Insufficient Balance"
            : "Buy Tokens"}
        </AnimatedButton>

        <p className="text-xs text-white/30 text-center mt-4">
          Tokens will be minted directly to your wallet. Network fees apply.
        </p>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4 mt-6"
      >
        {[
          { label: "Instant", desc: "Delivery" },
          { label: "Low", desc: "Fees" },
          { label: "Secure", desc: "Transaction" },
        ].map((item) => (
          <div
            key={item.label}
            className="text-center p-4 rounded-xl bg-white/5 border border-white/5"
          >
            <p className="font-semibold text-white/80">{item.label}</p>
            <p className="text-xs text-white/40">{item.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
