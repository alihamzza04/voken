import * as React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/program';
import { toast } from 'react-hot-toast';

interface VotingCardProps {
  candidateId: number;
  candidateName: string;
  candidateImage: string;
  voteCount: number;
  onVote: (candidateId: number) => void;
}

export const VotingCard: React.FC<VotingCardProps> = ({
  candidateId,
  candidateName,
  candidateImage,
  voteCount,
  onVote,
}) => {
  const { connected, publicKey } = useWallet();
  const [isVoting, setIsVoting] = React.useState(false);

  const handleVote = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsVoting(true);
    try {
      const program = getProgram();
      
      // Create PDA for voter account
      const [voterPda] = PublicKey.findProgramAddressSync(
        [publicKey.toBuffer(), Buffer.from(candidateId.toString())],
        program.programId
      );

      // Call vote instruction
      await program.methods
        .vote(candidateId)
        .accounts({
          voter: publicKey,
          voterAccount: voterPda,
          systemProgram: '11111111111111111111111111111111',
        })
        .rpc();

      toast.success('Vote cast successfully!');
      onVote(candidateId);
    } catch (error) {
      console.error('Voting error:', error);
      toast.error('Failed to cast vote');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="voting-card"
    >
      <div className="candidate-info">
        <img src={candidateImage} alt={candidateName} className="candidate-image" />
        <h3 className="candidate-name">{candidateName}</h3>
        <p className="vote-count">{voteCount} votes</p>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleVote}
        disabled={isVoting}
        className="vote-button"
      >
        {isVoting ? 'Voting...' : 'Vote'}
      </motion.button>
    </motion.div>
  );
};