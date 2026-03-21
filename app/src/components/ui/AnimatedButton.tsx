import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}

const variants = {
  primary: "btn-gradient",
  secondary: "btn-secondary",
  danger:
    "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg font-semibold px-6 py-3 transition-all",
  ghost:
    "bg-transparent border border-white/10 text-white/70 hover:bg-white/5 hover:text-white rounded-lg font-medium px-6 py-3 transition-all",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3",
  lg: "px-8 py-4 text-lg",
};

export function AnimatedButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  className = "",
}: AnimatedButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        ${variant === "primary" ? variants.primary : ""}
        ${variant === "secondary" ? variants.secondary : ""}
        ${variant === "danger" ? variants.danger : ""}
        ${variant === "ghost" ? variants.ghost : ""}
        ${variant !== "primary" && variant !== "secondary" ? "" : sizes[size]}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <Loader2 className="w-5 h-5 animate-spin" />
        </motion.div>
      )}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}
