import React, { useState, useEffect } from 'react';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const processingPhases = [
  'Analisando contexto técnico',
  'Mapeando ferramentas disponíveis',
  'Estruturando arquitetura da solução',
  'Calculando ROI e custos reais',
  'Gerando checklist executável',
  'Definindo integrações necessárias',
  'Criando passo-a-passo detalhado',
  'Validando viabilidade técnica',
  'Estimando tempo de implementação',
  'Finalizando solução Miracle AI',
];

const technicalLogs = [
  'Checando se as ferramentas se integram',
  'Validando se o orçamento fecha',
  'Definindo ordem de implementação',
  'Mapeando pontos de falha',
  'Analisando dependências técnicas',
  'Verificando requisitos de infraestrutura',
  'Calculando capacidade necessária',
  'Validando escalabilidade',
];

export const MiracleProcessingExperience: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Timer
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 8;
      });
    }, 800);

    // Phases
    const phaseInterval = setInterval(() => {
      setCurrentPhase(prev => {
        if (prev >= processingPhases.length - 1) return prev;
        return prev + 1;
      });
    }, 2500);

    // Logs
    const logInterval = setInterval(() => {
      const randomLog = technicalLogs[Math.floor(Math.random() * technicalLogs.length)];
      setLogs(prev => {
        const newLogs = [...prev, randomLog];
        return newLogs.slice(-4); // Keep only last 4
      });
    }, 1800);

    return () => {
      clearInterval(timer);
      clearInterval(progressInterval);
      clearInterval(phaseInterval);
      clearInterval(logInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <LiquidGlassCard className="w-full max-w-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">MIRACLE AI - Processando Solução</h2>
          <p className="text-sm text-muted-foreground">
            Analisando todos os aspectos técnicos da sua solução
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm font-medium">{Math.min(Math.round(progress), 100)}%</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-3" />
        </div>

        {/* Current Phase */}
        <div className="mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="inline-block px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-base font-medium text-primary">
                  {processingPhases[currentPhase]}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Technical Logs */}
        <div className="mb-6 space-y-2 min-h-[100px]">
          <p className="text-xs text-muted-foreground mb-2">Processamento:</p>
          <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs space-y-1 border border-border/50">
            <AnimatePresence>
              {logs.map((log, index) => (
                <motion.div
                  key={`${log}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-primary">&gt;</span>
                  <span className="text-foreground/70">{log}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Tempo decorrido: <span className="font-mono font-medium">{formatTime(elapsedTime)}</span>
          </p>
        </div>
      </LiquidGlassCard>
    </div>
  );
};