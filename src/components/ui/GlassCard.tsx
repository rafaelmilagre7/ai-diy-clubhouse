
import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  className?: string;
  variant?: "default" | "revenue" | "operational" | "strategy";
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  className, 
  variant = "default", 
  children 
}) => {
  const baseClasses = "rounded-2xl shadow-xl transition-all duration-300";
  
  const variantClasses = {
    default: "glassmorphism border-viverblue/20",
    revenue: "glassmorphism border-l-4 border-l-revenue border-t border-r border-b border-revenue/20",
    operational: "glassmorphism border-l-4 border-l-operational border-t border-r border-b border-operational/20",
    strategy: "glassmorphism border-l-4 border-l-strategy border-t border-r border-b border-strategy/20"
  };
  
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
};
