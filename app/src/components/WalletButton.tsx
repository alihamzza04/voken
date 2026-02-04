import * as React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';

export const WalletButton: React.FC = () => {
  const { publicKey, connected, connecting } = useWallet();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="wallet-container"
    >
      <WalletMultiButton className="wallet-btn" />
      {connecting && (
        <div className="wallet-info">
          <span className="wallet-address">Connecting...</span>
        </div>
      )}
      {connected && publicKey && (
        <div className="wallet-info">
          <span className="wallet-address">
            {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          </span>
        </div>
      )}
    </motion.div>
  );
};
