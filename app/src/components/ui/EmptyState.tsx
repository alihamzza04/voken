import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center"
      >
        <Icon className="w-10 h-10 text-white/20" />
      </motion.div>
      
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/50 mb-6 max-w-sm mx-auto">{description}</p>
      
      {actionLabel && (actionHref || onAction) && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {actionHref ? (
            <Link
              to={actionHref}
              className="btn-gradient inline-flex items-center gap-2"
            >
              {actionLabel}
            </Link>
          ) : (
            <button onClick={onAction} className="btn-gradient">
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
