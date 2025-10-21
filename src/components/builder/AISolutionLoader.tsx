import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Sparkles } from 'lucide-react';

const loadingPhrases = [
  'Analisando sua ideia...',
  'Mapeando ferramentas ideais...',
  'Estruturando framework de implementação...',
  'Criando checklist personalizado...',
  'Finalizando sua solução...'
];

export const AISolutionLoader = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Rotação de frases a cada 4 segundos
    const phraseInterval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
    }, 4000);

    // Progresso simulado
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 5;
      });
    }, 500);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <LiquidGlassCard className="p-12">
      <div className="space-y-8 max-w-md mx-auto">
        {/* Logo Animado */}
        <div className="relative h-32 flex items-center justify-center">
          {/* Círculos Animados */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary" />
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              rotate: -360
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="w-32 h-32 rounded-full border-4 border-primary/10 border-r-primary/50" />
          </motion.div>

          {/* Logo Central */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            animate={{
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="h-12 w-12 text-primary" />
            <div className="mt-4 text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              VIVER DE IA
            </div>
          </motion.div>
        </div>

        {/* Frases Animadas */}
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentPhraseIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center text-lg font-medium text-foreground/90"
            >
              {loadingPhrases[currentPhraseIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Indicadores de Fase */}
        <div className="flex justify-center gap-2">
          {loadingPhrases.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentPhraseIndex 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-muted'
              }`}
              animate={{
                scale: index === currentPhraseIndex ? 1.2 : 1
              }}
            />
          ))}
        </div>

        {/* Dica */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-center text-muted-foreground"
        >
          Isso pode levar até 30 segundos. Estamos criando algo especial para você! ✨
        </motion.p>
      </div>
    </LiquidGlassCard>
  );
};
