import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { Wallet, Coins, ArrowRight } from "lucide-react";
import {
  useTreasuryConfig,
  useSolBalance,
  useBuyTokens,
} from "../hooks/useProgram";
import { useState, useMemo } from "react";

export function BuyTokens() {
  const { connected } = useWallet();
  const { data: treasuryConfig } = useTreasuryConfig();
  const { data: solBalance } = useSolBalance();
  const buyTokensMutation = useBuyTokens();

  const [solAmount, setSolAmount] = useState("1");

  const tokenAmount = useMemo(() => {
    if (!treasuryConfig || !solAmount) return 0;
    const sol = parseFloat(solAmount);
    if (isNaN(sol) || sol <= 0) return 0;
    return (sol * treasuryConfig.tokensPerPurchase) / treasuryConfig.solPrice;
  }, [solAmount, treasuryConfig]);

  const handleBuy = async () => {
    const solInLamports = Math.floor(parseFloat(solAmount) * 1000000000);
    if (solInLamports <= 0) return;
    buyTokensMutation.mutate();
  };

  if (!connected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-gray-400">Connect your wallet to buy tokens</p>
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
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Coins className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Buy Voken Tokens</h1>
            <p className="text-gray-400">Exchange SOL for governance tokens</p>
          </div>
        </div>

        {!treasuryConfig ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              Treasury must be initialized before buying tokens
            </p>
            <a href="/admin" className="text-purple-400 hover:text-purple-300">
              Go to Admin Dashboard →
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-green-500/10 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Exchange Rate</span>
                <span className="font-semibold">
                  {treasuryConfig.tokensPerPurchase} tokens ={" "}
                  {treasuryConfig.solPrice / 1000000000} SOL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Your SOL Balance</span>
                <span className="font-semibold">
                  {solBalance?.toFixed(4) || "0.0000"} SOL
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  SOL Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={solAmount}
                    onChange={(e) => setSolAmount(e.target.value)}
                    min="0.001"
                    step="0.001"
                    className="w-full px-4 py-4 pr-24 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    SOL
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  You will receive
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tokenAmount.toLocaleString()}
                    readOnly
                    className="w-full px-4 py-4 pr-24 rounded-xl bg-white/5 border border-white/10 text-lg font-semibold text-green-400"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    VKN
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={
                buyTokensMutation.isPending ||
                !solAmount ||
                parseFloat(solAmount) <= 0
              }
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-green-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              {buyTokensMutation.isPending ? "Processing..." : "Buy Tokens"}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Tokens will be minted to your wallet automatically. A small
              network fee applies.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
