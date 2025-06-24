
import React from "react";

interface FadeTransitionProps {
  children: React.ReactNode;
  delay?: number;
}

export const FadeTransition = ({ children, delay = 0 }: FadeTransitionProps) => {
  return (
    <div 
      className="animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};
