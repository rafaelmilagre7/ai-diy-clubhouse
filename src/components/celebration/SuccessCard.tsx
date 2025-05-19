
import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Sparkles } from "lucide-react";

interface SuccessCardProps {
  title: string;
  message: string;
  type?: "implementation" | "completion" | "achievement" | "step"; // Adicionado "step" como tipo válido
  showConfetti?: boolean;
  className?: string;
  onClick?: () => void;
  onAnimationComplete?: () => void; // Adicionado callback para fim de animação
}

export const SuccessCard: React.FC<SuccessCardProps> = ({
  title,
  message,
  type = "completion",
  showConfetti = false,
  className,
  onClick,
  onAnimationComplete
}) => {
  // Executar callback quando terminar animação, se fornecido
  React.useEffect(() => {
    if (onAnimationComplete) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 3000); // Executa após 3 segundos de exibição
      
      return () => clearTimeout(timer);
    }
  }, [onAnimationComplete]);
  
  // Definir cores baseadas no tipo
  const getColors = () => {
    switch (type) {
      case "implementation":
        return "bg-gradient-to-br from-[#151823] to-[#1A1E2E] border-[#0ABAB5]/30";
      case "achievement":
        return "bg-gradient-to-br from-amber-950/40 to-amber-900/20 border-amber-500/30";
      case "step":
        return "bg-gradient-to-br from-indigo-950/40 to-indigo-900/20 border-indigo-500/30";
      default:
        return "bg-gradient-to-br from-[#151823] to-[#1E1F2B] border-indigo-500/30";
    }
  };
  
  const getIconColor = () => {
    switch (type) {
      case "implementation":
        return "text-[#0ABAB5]";
      case "achievement":
        return "text-amber-400";
      case "step":
        return "text-indigo-400";
      default:
        return "text-indigo-400";
    }
  };
  
  return (
    <div
      className={cn(
        "p-4 rounded-lg shadow-lg border animate-scale-in",
        getColors(),
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full bg-${getIconColor().split("-")[1]}-500/20 flex items-center justify-center flex-shrink-0`}>
          {type === "implementation" ? (
            <Sparkles className={cn("h-5 w-5", getIconColor())} />
          ) : (
            <CheckCircle2 className={cn("h-5 w-5", getIconColor())} />
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="text-lg font-medium text-white mb-1">{title}</h4>
          <p className="text-neutral-300 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};
