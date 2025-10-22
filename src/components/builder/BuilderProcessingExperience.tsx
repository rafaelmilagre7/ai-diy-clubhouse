import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LOADING_MESSAGES = [
  "Extraindo conhecimento do cérebro do Rafael...",
  "Analisando padrões de automação com IA...",
  "Consultando milhares de soluções implementadas...",
  "Mapeando ferramentas e integrações ideais...",
  "Criando seu plano personalizado de implementação...",
  "Conectando os pontos entre IA e seu negócio...",
  "Estruturando fluxos de trabalho automatizados...",
  "Otimizando a arquitetura da sua solução..."
];

export const BuilderProcessingExperience = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Rotação de mensagens a cada 4.5 segundos
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 4500);
    return () => clearInterval(messageInterval);
  }, []);

  // Timer de tempo decorrido
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-background via-background to-surface-elevated/10">
      
      {/* Animação central - Roda tecnológica tripla */}
      <motion.div className="relative w-32 h-32 mb-12">
        {/* Círculo externo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-aurora-primary/30 border-t-aurora-primary"
        />
        
        {/* Círculo médio (contra-rotação) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-4 border-aurora-primary/20 border-r-aurora-primary/70"
        />
        
        {/* Círculo interno */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border-4 border-aurora-primary/10 border-b-aurora-primary/50"
        />
        
        {/* Ícone central fixo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-aurora-primary" />
        </div>
      </motion.div>

      {/* Mensagem rotativa com fade in/out */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentMessageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-medium text-foreground text-center max-w-2xl mb-8 px-4"
        >
          {LOADING_MESSAGES[currentMessageIndex]}
        </motion.p>
      </AnimatePresence>

      {/* Tempo decorrido (discreto) */}
      <div className="text-sm text-muted-foreground/70">
        {formatTime(elapsedTime)}
      </div>
    </div>
  );
};
