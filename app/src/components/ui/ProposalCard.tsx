import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, Users, ChevronRight, CheckCircle2 } from "lucide-react";
import { formatDate } from "../../lib/utils";
import { CountdownTimer } from "./CountdownTimer";

interface ProposalCardProps {
  proposalId: number;
  proposalInfo: string;
  deadline: number;
  numberOfVotes: number;
  status: "active" | "ended" | "closed";
  index?: number;
  showCountdown?: boolean;
}

export function ProposalCard({
  proposalId,
  proposalInfo,
  deadline,
  numberOfVotes,
  status,
  index = 0,
  showCountdown = true,
}: ProposalCardProps) {
  const isActive = status === "active";
  const isEnded = status === "ended";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
    >
      <Link
        to={`/proposals/${proposalId}`}
        className={`glass-card p-6 block transition-all duration-300 hover:scale-[1.02] group ${
          isActive ? "hover:border-green-500/30" : "opacity-75 hover:opacity-100"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono text-white/40">
                #{proposalId.toString().padStart(3, "0")}
              </span>
              {isActive ? (
                <span className="badge badge-active">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Active
                </span>
              ) : isEnded ? (
                <span className="badge badge-ended">
                  <CheckCircle2 className="w-3 h-3" />
                  Ended
                </span>
              ) : (
                <span className="badge badge-error">Closed</span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
              {proposalInfo}
            </h3>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-white/60">
                <Users className="w-4 h-4" />
                <span>
                  <span className="font-semibold text-white">{numberOfVotes}</span> votes
                </span>
              </div>
              
              {isActive && showCountdown ? (
                <div className="flex items-center gap-2 text-green-400">
                  <Clock className="w-4 h-4" />
                  <CountdownTimer deadline={deadline} />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white/40">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(deadline)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <motion.div
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors"
            whileHover={{ x: 4 }}
          >
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-purple-400 transition-colors" />
          </motion.div>
        </div>

        {/* Progress Bar for Active Proposals */}
        {isActive && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/40 mb-2">
              <span>Voting Progress</span>
              <span>{numberOfVotes} votes cast</span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((numberOfVotes / 100) * 100, 100)}%` }}
                transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
              />
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
