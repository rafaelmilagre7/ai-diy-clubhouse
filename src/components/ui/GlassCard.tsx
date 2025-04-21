
import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  className?: string;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ className, children }) => (
  <div
    className={cn(
      "glass rounded-2xl shadow-xl border border-white/10 backdrop-blur-xl bg-white/30 dark:bg-[#1A1F2C]/40",
      className
    )}
  >
    {children}
  </div>
);

