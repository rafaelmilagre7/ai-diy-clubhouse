import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Lightbulb, 
  Network, 
  Target, 
  Zap,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';

interface TrailGenerationLoaderProps {
  message?: string;
}

const STAGES = [
  { icon: Brain, label: 'Analisando seu perfil...', color: 'text-cyan-400' },
  { icon: Lightbulb, label: 'Identificando objetivos...', color: 'text-yellow-400' },
  { icon: Network, label: 'Mapeando soluções...', color: 'text-teal-400' },
  { icon: Target, label: 'Priorizando trilha...', color: 'text-emerald-400' },
  { icon: TrendingUp, label: 'Calculando ROI...', color: 'text-blue-400' },
  { icon: Zap, label: 'Otimizando sequência...', color: 'text-violet-400' },
  { icon: Users, label: 'Personalizando aulas...', color: 'text-pink-400' },
  { icon: CheckCircle2, label: 'Validando recomendações...', color: 'text-green-400' },
  { icon: Sparkles, label: 'Finalizando trilha...', color: 'text-orange-400' },
];

export const TrailGenerationLoader: React.FC<TrailGenerationLoaderProps> = ({ 
  message = "Criando sua trilha personalizada com IA..." 
}) => {
  const [currentStageIndex, setCurrentStageIndex] = React.useState(0);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [estimatedTime] = React.useState(45); // Tempo estimado para geração de trilha
  
  // Ciclo pelos estágios
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 3500);
    
    return () => clearInterval(interval);
  }, []);

  // Timer de progresso
  React.useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const currentStage = STAGES[currentStageIndex];
  const IconComponent = currentStage.icon;
  const progressPercent = Math.min((elapsedTime / estimatedTime) * 100, 95);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8 px-4 bg-gradient-to-br from-background via-background to-surface-elevated">
      {/* Ícone animado */}
      <motion.div
        key={currentStageIndex}
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0, rotate: 180, opacity: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 200, 
          damping: 20 
        }}
        className="relative"
      >
        {/* Glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 blur-2xl"
        />
        
        {/* Ícone */}
        <div className={`relative p-8 rounded-full bg-gradient-to-br from-surface-elevated to-background border-2 border-primary/30 ${currentStage.color}`}>
          <IconComponent className="h-16 w-16" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Texto do estágio */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStageIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-2"
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {currentStage.label}
          </h3>
          <p className="text-muted-foreground text-sm">
            {message}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Barra de progresso com tempo real */}
      <div className="w-full max-w-md space-y-3">
        <div className="relative h-3 bg-surface-elevated rounded-full overflow-hidden border border-border/50">
          {/* Progresso real baseado em tempo estimado */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ 
              duration: 0.5,
              ease: 'easeOut' 
            }}
          />
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </div>

        {/* Tempo decorrido vs estimado */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{Math.round(progressPercent)}% concluído</span>
          <span>{elapsedTime}s / ~{estimatedTime}s</span>
        </div>
      </div>

      {/* Indicadores pulsantes */}
      <div className="flex gap-2 mt-4">
        {STAGES.map((s, idx) => (
          <motion.div
            key={idx}
            animate={{
              scale: idx === currentStageIndex ? 1.2 : 0.8,
              opacity: idx === currentStageIndex ? 1 : 0.3,
            }}
            transition={{ duration: 0.3 }}
            className={`h-2 w-2 rounded-full ${
              idx === currentStageIndex
                ? 'bg-gradient-to-r from-primary to-primary/60' 
                : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Mensagem de encorajamento */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-sm text-muted-foreground max-w-md"
      >
        ✨ Criando uma trilha 100% personalizada baseada no seu perfil, objetivos e nível de experiência
      </motion.p>
    </div>
  );
};