import * as React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { WalletButton } from './WalletButton';
import { VotingCard } from './VotingCard';
import { toast } from 'react-hot-toast';

const candidates = [
  {
    id: 1,
    name: 'Alice Johnson',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Bob Smith',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Carol Davis',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
];

export const Dashboard: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [voteCounts, setVoteCounts] = React.useState<Record<number, number>>({});
  const [hasVoted, setHasVoted] = React.useState(false);

  React.useEffect(() => {
    if (connected) {
      fetchVoteCounts();
      checkIfVoted();
    }
  }, [connected, publicKey]);

  const fetchVoteCounts = async () => {
    // Mock vote counts - in a real app, you'd fetch from the blockchain
    setVoteCounts({
      1: 156,
      2: 234,
      3: 98,
    });
  };

  const checkIfVoted = async () => {
    // Mock check - in a real app, you'd check the blockchain
    setHasVoted(false);
  };

  const handleVote = (candidateId: number) => {
    setVoteCounts(prev => ({
      ...prev,
      [candidateId]: (prev[candidateId] || 0) + 1,
    }));
    setHasVoted(true);
    toast.success('Thank you for voting!');
  };

  return (
    <div className="dashboard">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="header"
      >
        <h1 className="title">Solana Voting App</h1>
        <p className="subtitle">Secure, transparent, and decentralized voting</p>
        <WalletButton />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="content"
      >
        {!connected ? (
          <div className="connect-prompt">
            <h2>Connect Your Wallet</h2>
            <p>Connect your Solana wallet to participate in voting</p>
          </div>
        ) : hasVoted ? (
          <div className="voting-complete">
            <h2>Thank You for Voting!</h2>
            <p>Your vote has been recorded on the blockchain</p>
          </div>
        ) : (
          <>
            <div className="candidates-grid">
              {candidates.map((candidate) => (
                <VotingCard
                  key={candidate.id}
                  candidateId={candidate.id}
                  candidateName={candidate.name}
                  candidateImage={candidate.image}
                  voteCount={voteCounts[candidate.id] || 0}
                  onVote={handleVote}
                />
              ))}
            </div>
            
            <div className="stats">
              <div className="stat-card">
                <span className="stat-label">Total Votes</span>
                <span className="stat-value">
                  {Object.values(voteCounts).reduce((a, b) => a + b, 0)}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Connected</span>
                <span className="stat-value">Yes</span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};