
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface EnhancedTrailMagicExperienceProps {
  onFinish: () => void;
}

export const EnhancedTrailMagicExperience: React.FC<EnhancedTrailMagicExperienceProps> = ({
  onFinish
}) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const phases = [
    {
      text: "Analisando seu perfil...",
      emoji: "🔍"
    },
    {
      text: "Gerando soluções personalizadas...",
      emoji: "🚀"
    },
    {
      text: "Finalizando sua experiência personalizada...",
      emoji: "✨"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          // Após completar, aguarda 1 segundo e redireciona automaticamente
          setTimeout(() => {
            // Dispara confetes antes de redirecionar
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
            onFinish();
          }, 1000);
          return 100;
        }
        return prev + 1.5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onFinish]);

  useEffect(() => {
    const phaseProgress = Math.floor(progress / 33.33);
    if (phaseProgress < phases.length && phaseProgress !== currentPhase) {
      setCurrentPhase(phaseProgress);
    }
  }, [progress, currentPhase, phases.length]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12">
      <motion.div
        className="text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Ícone da fase atual com animação */}
        <motion.div
          className="text-6xl mb-4"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: progress >= 100 ? 360 : 0
          }}
          transition={{ 
            scale: { repeat: Infinity, duration: 2 },
            rotate: { duration: 1 }
          }}
        >
          {phases[currentPhase]?.emoji}
        </motion.div>

        {/* Texto da fase atual */}
        <motion.h2
          className="text-2xl font-bold text-white mb-6"
          key={currentPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {phases[currentPhase]?.text}
        </motion.h2>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-viverblue to-viverblue-light rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        {/* Porcentagem */}
        <motion.p
          className="text-viverblue-light font-semibold text-lg"
          animate={{ scale: progress >= 100 ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.5 }}
        >
          {Math.round(progress)}%
        </motion.p>

        {/* Mensagem de conclusão */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 mt-8"
          >
            <div className="text-3xl font-bold text-viverblue">
              🎉 Pronto!
            </div>
            <p className="text-gray-300">
              Redirecionando para sua experiência personalizada...
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
