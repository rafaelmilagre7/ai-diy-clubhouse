import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface TrailMagicExperienceProps {
  onFinish: () => void;
}

export const TrailMagicExperience: React.FC<TrailMagicExperienceProps> = ({
  onFinish
}) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const phases = [
    {
      text: "Analisando seu perfil...",
      animation: "rotate"
    },
    {
      text: "Gerando soluções personalizadas...",
      animation: "scale"
    },
    {
      text: "Otimizando sua trilha...",
      animation: "slide"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          // Após completar, aguarda 2 segundos e redireciona automaticamente
          setTimeout(() => {
            onFinish();
          }, 2000);
          return 100;
        }
        return prev + 2;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [onFinish]);

  useEffect(() => {
    if (progress > 0 && progress % 33 === 0 && currentPhase < phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    }
  }, [progress, currentPhase, phases.length]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div
        className="relative h-24 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{
          loop: Infinity,
          duration: 2,
          ease: "linear"
        }}
      >
        <svg
          className="absolute w-16 h-16 text-[#0ABAB5] animate-pulse"
          fill="currentColor"
          viewBox="0 0 200 200"
        >
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            strokeWidth="15"
            stroke="#0ABAB5"
            fill="none"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </svg>
        <div className="text-center">
          <div className="text-xl font-semibold text-white">
            {phases[currentPhase].text}
          </div>
        </div>
      </motion.div>

      <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700">
        <motion.div
          className="bg-[#0ABAB5] h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Remover o botão "Ver Minha Trilha" pois agora redireciona automaticamente */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="text-2xl font-bold text-[#0ABAB5]">
            ✨ Trilha personalizada pronta!
          </div>
          <p className="text-gray-300">
            Redirecionando para a página de conclusão...
          </p>
        </motion.div>
      )}
    </div>
  );
};
