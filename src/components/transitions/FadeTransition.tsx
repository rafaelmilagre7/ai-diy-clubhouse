
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  className,
  delay = 0,
  direction = "up"
}) => {
  // Configuração da animação baseada na direção
  const getDirectionProps = () => {
    switch (direction) {
      case "up":
        return { initial: { y: 20 }, animate: { y: 0 } };
      case "down":
        return { initial: { y: -20 }, animate: { y: 0 } };
      case "left":
        return { initial: { x: 20 }, animate: { x: 0 } };
      case "right":
        return { initial: { x: -20 }, animate: { x: 0 } };
      default:
        return { initial: {}, animate: {} };
    }
  };

  const directionProps = getDirectionProps();

  return (
    <motion.div
      initial={{ opacity: 0, ...directionProps.initial }}
      animate={{ opacity: 1, ...directionProps.animate }}
      transition={{ 
        duration: 0.4, 
        ease: "easeOut",
        delay 
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
