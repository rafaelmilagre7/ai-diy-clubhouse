import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const processingSteps = [
  "Extraindo o Cérebro do Rafael",
  "Analisando sua ideia contra 2.847 soluções já criadas",
  "Conectando com base de conhecimento Builder",
  "Mapeando ferramentas que você já conhece",
  "Identificando gaps e oportunidades técnicas",
  "Calculando viabilidade técnica e ROI",
  "Estruturando arquitetura em tempo real",
  "Definindo stack tecnológico otimizado",
  "Gerando fluxograma de implementação",
  "Montando checklist executável detalhado",
  "Estimando custos de setup e operação",
  "Validando integrações necessárias",
  "Compilando framework estratégico",
  "Organizando mapa mental da solução",
  "Finalizando plano técnico completo"
];

export const BuilderProcessingExperience = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Progresso gradual - LIMITA A 85% até solução estar pronta
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) return 85; // PARA EM 85% até resposta chegar
        // Progresso mais devagar: 70% do tempo em 0-60%, 30% em 60-85%
        const increment = prev < 60 ? Math.random() * 3 : Math.random() * 1.5;
        return Math.min(prev + increment, 85);
      });
    }, 500);

    // Trocar step
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % processingSteps.length);
    }, 2500);

    // Timer
    const timerInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-background to-surface-elevated/10">
      {/* Container mais minimalista e transparente */}
      <div className="w-full max-w-3xl">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12 space-y-8">
          
          {/* Header minimalista */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-foreground">
              Extraindo o Cérebro do Rafael
            </h2>
            <p className="text-muted-foreground text-sm">
              Builder está criando seu plano personalizado
            </p>
          </div>

          {/* Barra de progresso minimalista */}
          <div className="space-y-3">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-aurora-primary via-aurora-primary-light to-aurora-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{Math.round(progress)}%</span>
              <span>{formatTime(elapsedTime)}</span>
            </div>
          </div>

          {/* Frase atual com animação suave */}
          <div className="min-h-[80px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="text-center"
              >
                <p className="text-lg text-foreground font-medium">
                  {processingSteps[currentStep]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Steps indicator (bolinhas) */}
          <div className="flex justify-center gap-2">
            {processingSteps.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'w-8 bg-aurora-primary' 
                    : 'w-1.5 bg-white/20'
                }`}
                initial={false}
                animate={{
                  scale: index === currentStep ? 1.2 : 1
                }}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};