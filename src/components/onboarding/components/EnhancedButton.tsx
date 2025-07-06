import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EnhancedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  animate?: boolean;
}

const variantStyles = {
  primary: "bg-gradient-to-r from-viverblue to-viverblue-light text-white shadow-lg shadow-viverblue/25 hover:shadow-viverblue/40 hover:scale-105",
  secondary: "bg-gradient-to-r from-strategy to-strategy-light text-white shadow-lg shadow-strategy/25 hover:shadow-strategy/40 hover:scale-105", 
  outline: "border-2 border-viverblue/50 text-viverblue hover:bg-viverblue/10 hover:border-viverblue",
  ghost: "text-slate-400 hover:text-white hover:bg-white/5"
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base", 
  lg: "px-8 py-4 text-lg"
};

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  animate = true
}) => {
  const buttonContent = (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-viverblue/50 disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {Icon && !loading && <Icon className="w-4 h-4" />}
      {children}
      
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    </button>
  );

  return animate ? (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className="group"
    >
      {buttonContent}
    </motion.div>
  ) : (
    <div className="group">
      {buttonContent}
    </div>
  );
};