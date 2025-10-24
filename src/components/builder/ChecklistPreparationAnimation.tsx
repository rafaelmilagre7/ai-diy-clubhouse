import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Network, 
  Lightbulb, 
  CheckCircle2, 
  Wrench, 
  Target, 
  Rocket,
  Brain,
  Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ChecklistPreparationAnimationProps {
  stage: number; // 0-8
  elapsedTime?: number;
}

const STAGES = [
  { icon: Brain, label: 'Analisando sua ideia...', color: 'text-cyan-400' },
  { icon: Lightbulb, label: 'Identificando requisitos...', color: 'text-yellow-400' },
  { icon: Network, label: 'Mapeando arquitetura...', color: 'text-teal-400' },
  { icon: Wrench, label: 'Selecionando ferramentas...', color: 'text-emerald-400' },
  { icon: Target, label: 'Definindo marcos...', color: 'text-blue-400' },
  { icon: Zap, label: 'Otimizando sequência...', color: 'text-violet-400' },
  { icon: CheckCircle2, label: 'Validando passos...', color: 'text-green-400' },
  { icon: Sparkles, label: 'Finalizando detalhes...', color: 'text-pink-400' },
  { icon: Rocket, label: 'Preparando para lançamento...', color: 'text-orange-400' },
];

export default function ChecklistPreparationAnimation({ 
  stage, 
  elapsedTime = 0 
}: ChecklistPreparationAnimationProps) {
  const currentStage = STAGES[Math.min(stage, STAGES.length - 1)];
  const IconComponent = currentStage.icon;
  const progressPercentage = ((stage + 1) / STAGES.length) * 100;
  
  // Estimativa de tempo restante (120s total)
  const estimatedTotal = 120;
  const timeRemaining = Math.max(0, estimatedTotal - elapsedTime);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-8 px-4">
      {/* Ícone animado */}
      <motion.div
        key={stage}
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
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 blur-2xl`}
        />
        
        {/* Ícone */}
        <div className={`relative p-8 rounded-full bg-gradient-to-br from-surface-elevated to-background border-2 border-primary/30 ${currentStage.color}`}>
          <IconComponent className="h-16 w-16" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Texto do estágio */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
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
            Etapa {stage + 1} de {STAGES.length}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Barra de progresso Aurora */}
      <div className="w-full max-w-md space-y-3">
        <div className="relative h-3 bg-surface-elevated rounded-full overflow-hidden border border-border/50">
          {/* Aurora gradient animado */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500"
            initial={{ x: '-100%' }}
            animate={{ 
              x: `${progressPercentage - 100}%`,
            }}
            transition={{ 
              duration: 0.8, 
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
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </div>

        {/* Info de progresso */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(progressPercentage)}% completo</span>
          <span>~{Math.ceil(timeRemaining)}s restantes</span>
        </div>
      </div>

      {/* Indicadores dos próximos passos */}
      <div className="flex gap-2 mt-4">
        {STAGES.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0.8, opacity: 0.3 }}
            animate={{
              scale: idx === stage ? 1.2 : 0.8,
              opacity: idx <= stage ? 1 : 0.3,
            }}
            className={`h-2 w-2 rounded-full ${
              idx <= stage 
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
        Estamos criando um plano de ação personalizado com 15-30 passos detalhados para sua solução. 
        Isso garante que você tenha um guia completo e prático! ✨
      </motion.p>
    </div>
  );
}
