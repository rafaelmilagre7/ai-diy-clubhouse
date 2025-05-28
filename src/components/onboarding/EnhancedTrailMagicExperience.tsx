
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Brain, Zap, Target, Rocket, Stars } from 'lucide-react';

interface EnhancedTrailMagicExperienceProps {
  onFinish: () => void;
}

export const EnhancedTrailMagicExperience: React.FC<EnhancedTrailMagicExperienceProps> = ({
  onFinish
}) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  const phases = [
    {
      text: "Analisando seu perfil empresarial...",
      icon: Brain,
      color: "#0ABAB5",
      description: "Identificando suas necessidades únicas"
    },
    {
      text: "Selecionando soluções personalizadas...",
      icon: Target,
      color: "#34D399",
      description: "Encontrando as melhores oportunidades"
    },
    {
      text: "Otimizando sua trilha de implementação...",
      icon: Rocket,
      color: "#8B5CF6",
      description: "Criando seu plano de ação"
    },
    {
      text: "Finalizando sua experiência personalizada...",
      icon: Stars,
      color: "#F59E0B",
      description: "Preparando tudo para você"
    }
  ];

  // Gerar partículas animadas
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  // Lógica de progresso e confetti
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (Math.random() * 3 + 1);
        
        // Mudar fase baseado no progresso
        if (newProgress > 25 && currentPhase === 0) {
          setCurrentPhase(1);
          triggerMiniConfetti();
        } else if (newProgress > 50 && currentPhase === 1) {
          setCurrentPhase(2);
          triggerMiniConfetti();
        } else if (newProgress > 75 && currentPhase === 2) {
          setCurrentPhase(3);
          triggerMiniConfetti();
        }
        
        if (newProgress >= 100) {
          clearInterval(timer);
          triggerFinalCelebration();
          setTimeout(onFinish, 3000);
          return 100;
        }
        
        return newProgress;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [currentPhase, onFinish]);

  const triggerMiniConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#0ABAB5', '#34D399', '#8B5CF6']
    });
  };

  const triggerFinalCelebration = () => {
    // Confetti em múltiplas explosões
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2
        },
        colors: ['#0ABAB5', '#34D399', '#8B5CF6', '#F59E0B']
      });
      
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2
        },
        colors: ['#0ABAB5', '#34D399', '#8B5CF6', '#F59E0B']
      });
    }, 250);
  };

  const currentPhaseData = phases[currentPhase];
  const IconComponent = currentPhaseData.icon;

  return (
    <div className="relative min-h-[500px] max-w-4xl mx-auto p-8">
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-viverblue rounded-full opacity-30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [-20, 20],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Círculo principal de progresso */}
      <div className="relative flex items-center justify-center mb-12">
        <div className="relative w-48 h-48">
          {/* Círculo de fundo */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgba(16, 185, 129, 0.1)"
              strokeWidth="8"
              fill="none"
            />
            {/* Círculo de progresso */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke={currentPhaseData.color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 40 * (1 - progress / 100),
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                filter: `drop-shadow(0 0 8px ${currentPhaseData.color}40)`
              }}
            />
          </svg>

          {/* Ícone central animado */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              key={currentPhase}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="p-6 rounded-full"
              style={{ 
                backgroundColor: `${currentPhaseData.color}20`,
                boxShadow: `0 0 30px ${currentPhaseData.color}40`
              }}
            >
              <IconComponent 
                className="w-12 h-12"
                style={{ color: currentPhaseData.color }}
              />
            </motion.div>
          </div>

          {/* Pulso de energia */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: `${currentPhaseData.color}10` }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>

      {/* Texto principal animado */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h2 
            className="text-3xl font-bold"
            style={{ color: currentPhaseData.color }}
          >
            {currentPhaseData.text}
          </h2>
          <p className="text-lg text-gray-300 max-w-md mx-auto">
            {currentPhaseData.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Barra de progresso elegante */}
      <div className="mt-8 space-y-3">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ 
              background: `linear-gradient(90deg, ${currentPhaseData.color}, #34D399)`
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
        </div>
      </div>

      {/* Indicadores de fase */}
      <div className="flex justify-center mt-8 space-x-4">
        {phases.map((phase, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-2"
            initial={{ opacity: 0.3 }}
            animate={{ 
              opacity: index <= currentPhase ? 1 : 0.3,
              scale: index === currentPhase ? 1.1 : 1
            }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className={`w-3 h-3 rounded-full ${
                index <= currentPhase ? 'opacity-100' : 'opacity-30'
              }`}
              style={{ 
                backgroundColor: index <= currentPhase ? phase.color : '#374151'
              }}
            />
            {index === currentPhase && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                className="text-xs text-gray-300 hidden sm:block"
              >
                Etapa {index + 1}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Mensagem final */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-8 space-y-4"
        >
          <div className="text-4xl">🎉</div>
          <h3 className="text-2xl font-bold text-viverblue">
            Trilha Personalizada Pronta!
          </h3>
          <p className="text-gray-300">
            Redirecionando para sua jornada de implementação...
          </p>
        </motion.div>
      )}
    </div>
  );
};
