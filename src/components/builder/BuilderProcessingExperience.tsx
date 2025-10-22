import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { BUILDER_STEPS } from '@/types/builderProgress';
import type { BuilderStep } from '@/types/builderProgress';

export const BuilderProcessingExperience = () => {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [steps, setSteps] = useState<BuilderStep[]>(
    BUILDER_STEPS.map(step => ({ ...step, status: 'pending' as const }))
  );

  useEffect(() => {
    // Timer de tempo decorrido
    const timerInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Atualizar progresso e steps baseado no tempo real
    const progressInterval = setInterval(() => {
      setElapsedTime(currentTime => {
        // Atualizar status dos steps baseado no tempo
        setSteps(prevSteps => 
          prevSteps.map(step => {
            if (currentTime >= step.estimatedEnd) {
              return { ...step, status: 'completed' };
            } else if (currentTime >= step.estimatedStart && currentTime < step.estimatedEnd) {
              return { ...step, status: 'active' };
            }
            return step;
          })
        );

        // Calcular progresso baseado no tempo (máx 85% até resposta chegar)
        const totalEstimated = 200; // segundos
        const calculatedProgress = Math.min((currentTime / totalEstimated) * 100, 85);
        setProgress(calculatedProgress);

        return currentTime;
      });
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStep = steps.find(s => s.status === 'active') || steps[steps.length - 1];
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const estimatedRemaining = Math.max(0, 200 - elapsedTime);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-background to-surface-elevated/10">
      <div className="w-full max-w-4xl">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 space-y-8">
          
          {/* Header com etapa atual */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aurora-primary/10 border border-aurora-primary/20 mb-4">
              <Loader2 className="h-4 w-4 animate-spin text-aurora-primary" />
              <span className="text-sm font-medium text-aurora-primary">
                Etapa {currentStep.id} de {steps.length}
              </span>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.h2
                key={currentStep.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-bold text-foreground"
              >
                {currentStep.label}
              </motion.h2>
            </AnimatePresence>
            
            <p className="text-muted-foreground text-sm">
              Builder está criando seu plano personalizado com Claude Sonnet 4.5
            </p>
          </div>

          {/* Barra de progresso */}
          <div className="space-y-3">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-aurora-primary via-aurora-primary-light to-aurora-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{Math.round(progress)}% completo</span>
              <div className="flex items-center gap-3">
                <span>Tempo: {formatTime(elapsedTime)}</span>
                {estimatedRemaining > 0 && (
                  <span className="text-aurora-primary">
                    ~{formatTime(estimatedRemaining)} restantes
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lista de etapas com checkmarks */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                  ${step.status === 'active' 
                    ? 'bg-aurora-primary/10 border border-aurora-primary/30' 
                    : step.status === 'completed'
                      ? 'bg-green-500/5 border border-green-500/20'
                      : 'bg-white/5 border border-white/10'
                  }
                `}
              >
                <div className={`
                  flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                  ${step.status === 'completed' 
                    ? 'bg-green-500' 
                    : step.status === 'active'
                      ? 'bg-aurora-primary'
                      : 'bg-white/10'
                  }
                `}>
                  {step.status === 'completed' ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : step.status === 'active' ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{step.id}</span>
                  )}
                </div>
                
                <span className={`
                  text-sm font-medium transition-colors duration-300
                  ${step.status === 'active' 
                    ? 'text-aurora-primary' 
                    : step.status === 'completed'
                      ? 'text-green-500'
                      : 'text-muted-foreground'
                  }
                `}>
                  {step.label}
                </span>

                {step.status === 'active' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-auto text-xs text-muted-foreground"
                  >
                    ~{step.estimatedEnd - step.estimatedStart}s
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Footer info */}
          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-muted-foreground">
              {completedSteps} de {steps.length} etapas concluídas • 
              Processamento intensivo em andamento
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
