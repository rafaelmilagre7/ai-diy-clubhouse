
import React from "react";
import { cn } from "@/lib/utils";

interface FadeTransitionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const FadeTransition = ({ children, delay = 0, className }: FadeTransitionProps) => {
  return (
    <div 
      className={cn("animate-fade-in", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};
