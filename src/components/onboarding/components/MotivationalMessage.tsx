import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, Heart } from 'lucide-react';

interface MotivationalMessageProps {
  step: number;
  completedSteps: number;
  totalSteps: number;
  className?: string;
}

const getMotivationalContent = (step: number, completedSteps: number, totalSteps: number) => {
  const percentage = Math.round((completedSteps / totalSteps) * 100);
  
  // Messages based on progress
  if (percentage >= 80) {
    return {
      icon: TrendingUp,
      message: "Incrível! Você está quase lá! Sua transformação com IA está tomando forma.",
      color: "text-green-400",
      bgColor: "from-green-500/10 to-green-400/5"
    };
  } else if (percentage >= 50) {
    return {
      icon: Zap,
      message: "Fantástico progresso! Você está na metade da jornada. Continue assim!",
      color: "text-viverblue",
      bgColor: "from-viverblue/10 to-viverblue-light/5"
    };
  } else if (percentage >= 25) {
    return {
      icon: Sparkles,
      message: "Ótimo começo! Cada resposta me ajuda a conhecer você melhor.",
      color: "text-yellow-400",
      bgColor: "from-yellow-500/10 to-yellow-400/5"
    };
  } else {
    return {
      icon: Heart,
      message: "Bem-vindo(a) à sua jornada personalizada! Vamos descobrir seu potencial juntos.",
      color: "text-pink-400",
      bgColor: "from-pink-500/10 to-pink-400/5"
    };
  }
};

export const MotivationalMessage: React.FC<MotivationalMessageProps> = ({
  step,
  completedSteps,
  totalSteps,
  className = ""
}) => {
  const content = getMotivationalContent(step, completedSteps, totalSteps);
  const IconComponent = content.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className={`
        relative p-4 rounded-2xl bg-gradient-to-r ${content.bgColor} 
        border border-white/10 backdrop-blur-sm ${className}
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 
          flex items-center justify-center ${content.color}
        `}>
          <IconComponent className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <p className="text-white text-sm font-medium leading-relaxed">
            {content.message}
          </p>
        </div>
      </div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 animate-pulse" />
    </motion.div>
  );
};

// Quick tips based on current step
export const getQuickTip = (step: number): string => {
  const tips = {
    1: "Dica: Seja autêntico! Essas informações me ajudam a criar recomendações precisas.",
    2: "Dica: Quanto mais detalhes sobre seu trabalho, melhor posso personalizar suas estratégias.",
    3: "Dica: Não há problema em ser iniciante - todos os experts começaram do zero!",
    4: "Dica: Objetivos claros geram resultados claros. Pense no que mais te motiva.",
    5: "Dica: Seja realista com seu tempo disponível - qualidade supera quantidade!",
    6: "Dica: Parabéns! Agora você tem um plano personalizado para dominar a IA!"
  };
  
  return tips[step as keyof typeof tips] || "Continue assim! Você está no caminho certo.";
};