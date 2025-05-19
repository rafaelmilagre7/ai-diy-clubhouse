
import { motion } from "framer-motion";
import React from "react";

interface FadeTransitionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({ 
  children,
  delay = 0,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
