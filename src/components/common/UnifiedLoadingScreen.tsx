import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface UnifiedLoadingScreenProps {
  title?: string;
  messages?: string[];
  estimatedSeconds?: number;
  showTimer?: boolean;
  showProgressBar?: boolean;
  className?: string;
  // Props antigas para compatibilidade
  message?: string;
  description?: string;
  showProgress?: boolean;
}

export const UnifiedLoadingScreen: React.FC<UnifiedLoadingScreenProps> = ({
  title = "Carregando...",
  messages = ["Preparando ambiente...", "Quase lá...", "Finalizando..."],
  estimatedSeconds = 30,
  showTimer = true,
  showProgressBar = true,
  className = "",
  // Props antigas
  message,
  description,
  showProgress,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Compatibilidade: usar props antigas se fornecidas
  const displayTitle = message || title;
  const displayMessages = messages;
  const displayShowProgress = showProgress !== undefined ? showProgress : showProgressBar;

  // Rotação de mensagens a cada 4.5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % displayMessages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [displayMessages.length]);

  // Timer de tempo decorrido
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cálculo de progresso baseado no tempo estimado
  const progress = useMemo(() => {
    return Math.min((elapsedTime / estimatedSeconds) * 100, 95);
  }, [elapsedTime, estimatedSeconds]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className={`fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}>
      <div className="w-full max-w-2xl mx-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/50 backdrop-blur-md rounded-2xl border border-border/50 p-8 shadow-2xl"
        >
          {/* Spinner principal */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-aurora-primary animate-spin" />
              <div className="absolute inset-0 h-16 w-16 bg-aurora-primary/20 rounded-full blur-xl animate-pulse" />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-foreground via-aurora-primary to-foreground bg-clip-text text-transparent">
            {displayTitle}
          </h2>

          {/* Mensagens rotativas */}
          <div className="h-6 mb-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-muted-foreground text-center text-sm"
              >
                {displayMessages[currentMessageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Descrição adicional (compatibilidade) */}
          {description && (
            <p className="text-muted-foreground text-center text-xs mb-6">
              {description}
            </p>
          )}

          {/* Barra de progresso */}
          {displayShowProgress && (
            <div className="mb-4">
              <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-aurora-primary to-aurora-primary-light"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Timer */}
          {showTimer && (
            <div className="flex justify-center">
              <span className="text-xs text-muted-foreground/70 font-mono">
                {formatTime(elapsedTime)}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

UnifiedLoadingScreen.displayName = 'UnifiedLoadingScreen';

export default UnifiedLoadingScreen;
