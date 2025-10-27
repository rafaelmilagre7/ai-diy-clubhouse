import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLoadingMessages } from '@/lib/loadingMessages';

interface BuilderSectionLoaderProps {
  title: string;
  messages: string[];
  estimatedSeconds?: number;
}

export const BuilderSectionLoader: React.FC<BuilderSectionLoaderProps> = ({ 
  title, 
  messages,
  estimatedSeconds = 45 
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Rotacionar mensagens a cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [messages.length]);

  // Contador de tempo
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-surface-elevated/20 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md"
      >
        {/* Card principal */}
        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
          {/* Spinner */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-[hsl(var(--aurora-primary))] animate-spin" />
              <div className="absolute inset-0 blur-xl bg-[hsl(var(--aurora-primary))]/20 animate-pulse"></div>
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {title}
          </h2>

          {/* Mensagem rotativa */}
          <div className="min-h-[60px] flex items-center justify-center mb-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center text-muted-foreground text-sm leading-relaxed px-4"
              >
                {messages[currentMessageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Barra de progresso estimada */}
          <div className="mt-6">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[hsl(var(--aurora-primary))] to-primary rounded-full"
                initial={{ width: '0%' }}
                animate={{ 
                  width: `${Math.min((elapsedSeconds / estimatedSeconds) * 100, 100)}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Timer discreto */}
          <div className="mt-4 text-right">
            <span className="text-xs text-muted-foreground/60">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(var(--aurora-primary))]/10 via-primary/5 to-[hsl(var(--aurora-primary))]/10 rounded-2xl blur-2xl -z-10"></div>
      </motion.div>
    </div>
  );
};

// Re-exportando mensagens da biblioteca centralizada
export const FRAMEWORK_MESSAGES = getLoadingMessages('builder_framework');
export const CHECKLIST_MESSAGES = getLoadingMessages('builder_checklist');
export const RECOMMENDATIONS_MESSAGES = getLoadingMessages('builder_recommendations');
