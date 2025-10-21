import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, Zap, CheckCircle2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';

const miraclePhrases = [
  { text: "Entrando na cabeça do Rafael Milagre... (cuidado, é caótico lá dentro)", icon: Brain },
  { text: "Conectando 47 pontos que você não sabia que existiam...", icon: Cpu },
  { text: "Rafael está pensando... (isso pode demorar, ele pensa MUITO)", icon: Brain },
  { text: "Traduzindo tecniquês para português normal...", icon: Sparkles },
  { text: "Removendo todo o hype e buzzwords inúteis...", icon: Zap },
  { text: "Mapeando ferramentas reais com preços reais...", icon: Cpu },
  { text: "Calculando ROI e métricas mensuráveis...", icon: Sparkles },
  { text: "Estruturando passo-a-passo executável...", icon: CheckCircle2 },
  { text: "Aplicando metodologia Viver de IA...", icon: Brain },
  { text: "Cortando enrolação e teoria inútil...", icon: Zap },
  { text: "Zerando promessas impossíveis...", icon: Cpu },
  { text: "Eliminando ilusões e focando no real...", icon: Sparkles },
  { text: "Calculando quanto você vai economizar/ganhar...", icon: Zap },
  { text: "Estimando tempo de implementação REAL...", icon: CheckCircle2 },
  { text: "Projetando crescimento sem aumentar custo...", icon: Cpu },
  { text: "Conectando IA + automação + dados + interface...", icon: Brain },
  { text: "Pensando como o Rafael pensaria...", icon: Sparkles },
  { text: "Criando framework ultra-detalhado...", icon: Zap },
  { text: "Montando checklist devastador...", icon: CheckCircle2 },
  { text: "Finalizando solução MIRACLE AI...", icon: Sparkles },
];

const subTasks = [
  "Analisando ideia e contexto...",
  "Mapeando ferramentas e arquitetura...",
  "Estruturando framework e quadrantes...",
  "Criando checklist detalhado...",
  "Validando e finalizando...",
];

export const MiracleLoadingExperience = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentSubTask, setCurrentSubTask] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  const CurrentIcon = miraclePhrases[currentPhrase].icon;

  useEffect(() => {
    // Progresso inteligente (0-100%)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        
        // Progresso mais rápido no início, mais lento no final
        let increment = 0;
        if (prev < 20) increment = Math.random() * 4; // 0-20%: rápido
        else if (prev < 40) increment = Math.random() * 3; // 20-40%: médio
        else if (prev < 70) increment = Math.random() * 2; // 40-70%: lento
        else increment = Math.random() * 1; // 70-95%: muito lento
        
        return Math.min(prev + increment, 95);
      });
    }, 500);

    // Rotação de frases (8-10s por frase)
    const phraseInterval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % miraclePhrases.length);
    }, 8000 + Math.random() * 2000);

    // Sub-tarefas baseadas no progresso
    const taskCheckInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 20 && !completedTasks.includes(0)) {
          setCompletedTasks((prev) => [...prev, 0]);
          setCurrentSubTask(1);
        }
        if (p >= 40 && !completedTasks.includes(1)) {
          setCompletedTasks((prev) => [...prev, 1]);
          setCurrentSubTask(2);
        }
        if (p >= 70 && !completedTasks.includes(2)) {
          setCompletedTasks((prev) => [...prev, 2]);
          setCurrentSubTask(3);
        }
        if (p >= 90 && !completedTasks.includes(3)) {
          setCompletedTasks((prev) => [...prev, 3]);
          setCurrentSubTask(4);
        }
        return p;
      });
    }, 1000);

    // Contador de tempo
    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phraseInterval);
      clearInterval(taskCheckInterval);
      clearInterval(timeInterval);
    };
  }, [completedTasks]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-background to-surface-elevated/20">
      <div className="w-full max-w-2xl">
        <LiquidGlassCard className="p-8">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aurora-primary/10 border border-aurora-primary/20">
              <Sparkles className="h-4 w-4 text-aurora-primary" />
              <span className="text-sm font-semibold text-aurora-primary">MIRACLE AI</span>
            </div>
          </div>

          {/* Ícone Animado */}
          <div className="relative h-32 flex items-center justify-center mb-8">
            {/* Pulse Background */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.05, 0.2]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-32 h-32 rounded-full bg-aurora-primary/20" />
            </motion.div>

            {/* Rotating Ring */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-aurora-primary border-r-aurora-primary/50" />
            </motion.div>

            {/* Center Icon */}
            <motion.div
              className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-aurora-primary to-aurora-primary/60 flex items-center justify-center shadow-2xl"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <CurrentIcon className="h-10 w-10 text-primary-foreground" />
            </motion.div>
          </div>

          {/* Frase Atual */}
          <div className="h-16 flex items-center justify-center mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhrase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="text-lg font-medium text-foreground px-4">
                  {miraclePhrases[currentPhrase].text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3 mb-6">
            <Progress 
              value={progress} 
              className="h-3"
              indicatorClassName="bg-gradient-to-r from-aurora-primary via-aurora-primary-light to-aurora-primary animate-shimmer"
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{Math.round(progress)}% concluído</span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{formatTime(elapsedTime)}</span>
                <span className="text-xs text-muted-foreground/70">~60-90s total</span>
              </div>
            </div>
          </div>

          {/* Sub-tarefas */}
          <div className="space-y-2 mb-6">
            {subTasks.map((task, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: completedTasks.includes(idx) ? 0.5 : idx === currentSubTask ? 1 : 0.3,
                  x: 0 
                }}
                className="flex items-center gap-3 text-sm"
              >
                {completedTasks.includes(idx) ? (
                  <CheckCircle2 className="h-4 w-4 text-status-success flex-shrink-0" />
                ) : idx === currentSubTask ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Cpu className="h-4 w-4 text-aurora-primary flex-shrink-0" />
                  </motion.div>
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted flex-shrink-0" />
                )}
                <span className={
                  completedTasks.includes(idx) 
                    ? "text-muted-foreground line-through" 
                    : idx === currentSubTask 
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground"
                }>
                  {task}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center pt-4 border-t border-border/50"
          >
            <p className="text-sm text-muted-foreground">
              💡 Criando um plano que o Rafael Milagre aprovaria...
            </p>
          </motion.div>
        </LiquidGlassCard>
      </div>
    </div>
  );
};
