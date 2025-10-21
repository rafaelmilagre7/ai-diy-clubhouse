import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Wrench, Lightbulb, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const loadingSteps = [
  {
    icon: Brain,
    text: 'Analisando sua ideia com IA...',
    duration: 8000
  },
  {
    icon: Wrench,
    text: 'Mapeando ferramentas e tecnologias...',
    duration: 8000
  },
  {
    icon: Lightbulb,
    text: 'Estruturando framework de implementação...',
    duration: 8000
  },
  {
    icon: CheckCircle,
    text: 'Criando checklist detalhado...',
    duration: 8000
  }
];

export const AISolutionLoader = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progresso suave
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 3;
      });
    }, 400);

    // Rotação de steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
    }, 8000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <div className="space-y-8">
        {/* Loading Animation */}
        <div className="relative h-40 flex items-center justify-center">
          {/* Pulse Background */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-32 h-32 rounded-full bg-primary/20" />
          </motion.div>

          {/* Rotating Ring */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-primary border-r-primary/50" />
          </motion.div>

          {/* Center Icon */}
          <motion.div
            className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl"
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Brain className="h-10 w-10 text-primary-foreground" />
          </motion.div>
        </div>

        {/* Current Step Text */}
        <div className="h-20 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-muted-foreground mb-1">
            Analisando com
          </p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              VIVER DE IA Intelligence
            </p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mt-2"
            >
              {React.createElement(loadingSteps[currentStep].icon, {
                className: "h-5 w-5 text-primary"
              })}
              <p className="text-base font-medium text-foreground">
                {loadingSteps[currentStep].text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <Progress 
            value={progress} 
            className="h-2"
            indicatorClassName="bg-gradient-to-r from-primary via-primary/80 to-primary/60"
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{Math.round(progress)}% concluído</span>
            <span>~30 segundos</span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2">
          {loadingSteps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStep 
                  ? 'w-12 bg-primary' 
                  : index < currentStep
                  ? 'w-6 bg-primary/50'
                  : 'w-6 bg-muted'
              }`}
              animate={{
                scale: index === currentStep ? 1.1 : 1
              }}
            />
          ))}
        </div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground">
            💡 Estamos criando um plano completo para você!
          </p>
        </motion.div>
      </div>
    </div>
  );
};
