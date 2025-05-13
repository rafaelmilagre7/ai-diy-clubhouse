
import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle, Award, Star } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface SuccessCardProps {
  title: string;
  message: string;
  type?: "step" | "module" | "implementation";
  className?: string;
  showConfetti?: boolean;
  onAnimationComplete?: () => void;
}

export const SuccessCard: React.FC<SuccessCardProps> = ({
  title,
  message,
  type = "step",
  className,
  showConfetti = true,
  onAnimationComplete
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Lançar confetes quando o card aparecer
  useEffect(() => {
    if (showConfetti && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: type === "implementation" ? 150 : 75,
        spread: 70,
        origin: { x, y: y - 0.1 }
      });
    }
  }, [showConfetti, type]);
  
  // Escolher o ícone baseado no tipo de conquista
  const renderIcon = () => {
    switch (type) {
      case "implementation":
        return <Award className="h-8 w-8 text-yellow-500" />;
      case "module":
        return <Star className="h-8 w-8 text-purple-500" />;
      default:
        return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
  };
  
  // Estilos baseados no tipo de conquista
  const getTypeStyles = () => {
    switch (type) {
      case "implementation":
        return "bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-300";
      case "module":
        return "bg-gradient-to-br from-purple-50 to-violet-100 border-purple-300";
      default:
        return "bg-gradient-to-br from-green-50 to-emerald-100 border-green-300";
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 15
      }}
      onAnimationComplete={onAnimationComplete}
      ref={cardRef}
    >
      <Card className={cn(
        "overflow-hidden border-2 shadow-lg",
        getTypeStyles(),
        className
      )}>
        <div className="p-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.2,
              type: "spring",
              stiffness: 300
            }}
            className="mx-auto mb-3 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/80 scale-150 blur-md"></div>
              <div className="relative bg-white p-3 rounded-full shadow-inner">
                {renderIcon()}
              </div>
            </div>
          </motion.div>
          
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold"
          >
            {title}
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-700 mt-2"
          >
            {message}
          </motion.p>
        </div>
      </Card>
    </motion.div>
  );
};
