import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: "purple" | "green" | "blue" | "yellow";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
  loading?: boolean;
}

const colorMap = {
  purple: "icon-box-purple",
  green: "icon-box-green",
  blue: "icon-box-blue",
  yellow: "icon-box-yellow",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "purple",
  trend,
  delay = 0,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="stat-card h-28">
        <div className="skeleton w-full h-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className="stat-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/60 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white truncate">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-green-400" : "text-red-400"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-white/40">vs last week</span>
            </div>
          )}
        </div>
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className={`icon-box icon-box-md ${colorMap[iconColor]} flex-shrink-0 ml-4`}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </div>
    </motion.div>
  );
}
