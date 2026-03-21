import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Vote,
  PlusCircle,
  Wallet,
  BarChart3,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { formatAddress } from "../lib/utils";

export function Navigation() {
  const { connected, publicKey } = useWallet();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/proposals", icon: Vote, label: "Proposals" },
    { path: "/create", icon: PlusCircle, label: "Create" },
    { path: "/buy-tokens", icon: Wallet, label: "Buy Tokens" },
    { path: "/admin", icon: BarChart3, label: "Admin" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mt-4">
          <div className="glass-card glass-card-active px-6 py-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center shadow-lg shadow-purple-500/20"
                >
                  <Vote className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-xl font-bold gradient-text">
                  Voken
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="relative px-4 py-2 rounded-lg transition-all duration-200 group"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-white/10 rounded-lg"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <div className="relative flex items-center gap-2">
                        <item.icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? "text-purple-400"
                              : "text-white/50 group-hover:text-white/70"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium transition-colors ${
                            isActive
                              ? "text-white"
                              : "text-white/50 group-hover:text-white/70"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Wallet & Mobile Menu */}
              <div className="flex items-center gap-4">
                {connected && publicKey && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm text-white/60 font-mono">
                      {formatAddress(publicKey.toString())}
                    </span>
                  </motion.div>
                )}
                
                <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-green-600 !border-0 !rounded-lg !font-semibold !px-4 !py-2" />
                
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-4 right-4 z-40 lg:hidden"
          >
            <div className="glass-card glass-card-active p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
