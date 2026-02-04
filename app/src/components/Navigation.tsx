import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Vote, PlusCircle, Wallet, BarChart3, User } from "lucide-react";
import { cn, formatAddress } from "../lib/utils";

export function Navigation() {
  const { connected, publicKey } = useWallet();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/proposals", icon: Vote, label: "Proposals" },
    { path: "/create", icon: PlusCircle, label: "Create Proposal" },
    { path: "/buy-tokens", icon: Wallet, label: "Buy Tokens" },
    { path: "/admin", icon: BarChart3, label: "Admin" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card m-4 rounded-2xl"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              Voken
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {connected && publicKey && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-gray-400 font-mono">
                  {formatAddress(publicKey.toString())}
                </span>
              </div>
            )}
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-green-600 !border-0 !rounded-lg !font-semibold" />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
