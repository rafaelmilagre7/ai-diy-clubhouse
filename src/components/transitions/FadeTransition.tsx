
import { motion } from "framer-motion";
import React from "react";

interface FadeTransitionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right"; // Adicionando a propriedade direction
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({ 
  children,
  delay = 0,
  className = "",
  direction
}) => {
  // Configurar animações baseadas na direção
  const getAnimationProps = () => {
    const base = { opacity: 0 };
    
    switch (direction) {
      case "up":
        return { ...base, y: 20 };
      case "down":
        return { ...base, y: -20 };
      case "left":
        return { ...base, x: 20 };
      case "right":
        return { ...base, x: -20 };
      default:
        return base;
    }
  };
  
  const getAnimateProps = () => {
    const base = { opacity: 1 };
    
    switch (direction) {
      case "up":
      case "down":
        return { ...base, y: 0 };
      case "left":
      case "right":
        return { ...base, x: 0 };
      default:
        return base;
    }
  };

  return (
    <motion.div
      initial={getAnimationProps()}
      animate={getAnimateProps()}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
