import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_MESSAGES = [
  "🧠 Hackeando o cérebro do Rafael Milagre...",
  "⚡ Turbinando a IA com café e automação...",
  "🔥 Vasculhando 10.000 soluções já implementadas...",
  "🚀 Misturando Claude, GPT e um toque de magia...",
  "🎯 Conectando ferramentas como nunca antes...",
  "💎 Lapidando sua ideia até brilhar...",
  "🤯 Processando mais rápido que você pisca...",
  "🎪 Fazendo malabarismo com APIs e integrações...",
  "🧙‍♂️ Invocando o poder da inteligência conectiva...",
  "🌪️ Criando um furacão de produtividade...",
  "🎨 Desenhando sua arquitetura com pixels de luz...",
  "🔮 Prevendo problemas antes de existirem...",
  "⚙️ Calibrando engrenagens de automação...",
  "🌟 Transformando complexidade em simplicidade...",
  "💥 Detonando limites do impossível...",
  "🎭 Orquestrando uma sinfonia de dados...",
  "🏗️ Construindo pontes entre IA e realidade...",
  "🔬 Destilando essência pura de inovação...",
  "🎯 Acertando no alvo da sua necessidade...",
  "🌈 Pintando o futuro do seu negócio..."
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
      <motion.div className="relative w-48 h-48 mb-16">
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
          className="absolute inset-3 rounded-full border-4 border-aurora-primary/20 border-r-aurora-primary/70"
        />
        
        {/* Círculo interno */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-6 rounded-full border-4 border-aurora-primary/10 border-b-aurora-primary/50"
        />
        
        {/* Logo central fixo - MUITO MAIOR */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png" 
            alt="Viver de IA" 
            className="h-32 w-32 object-contain"
          />
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
