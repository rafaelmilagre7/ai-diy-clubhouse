
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrailMagicExperienceProps {
  onFinish: () => void;
}

export const TrailMagicExperience: React.FC<TrailMagicExperienceProps> = ({ onFinish }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const phases = [
    {
      title: "Analisando seu perfil...",
      description: "Processando suas informações pessoais e profissionais",
      duration: 2000,
      icon: <Sparkles className="w-8 h-8 text-yellow-400" />
    },
    {
      title: "Identificando oportunidades de IA...",
      description: "Mapeando as melhores soluções para seu negócio",
      duration: 2500,
      icon: <Wand2 className="w-8 h-8 text-purple-400" />
    },
    {
      title: "Criando sua trilha personalizada...",
      description: "Organizando um plano de implementação sob medida",
      duration: 2000,
      icon: <CheckCircle className="w-8 h-8 text-green-400" />
    }
  ];

  useEffect(() => {
    if (currentPhase < phases.length) {
      const timer = setTimeout(() => {
        setCurrentPhase(prev => prev + 1);
      }, phases[currentPhase]?.duration || 2000);

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      // Auto-redirect após mostrar "Trilha personalizada pronta!"
      setTimeout(() => {
        onFinish();
      }, 3000);
    }
  }, [currentPhase, phases, onFinish]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <div className="text-center space-y-8">
          {!isComplete ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="flex justify-center">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity }
                    }}
                  >
                    {phases[currentPhase]?.icon}
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    {phases[currentPhase]?.title}
                  </h3>
                  <p className="text-gray-300">
                    {phases[currentPhase]?.description}
                  </p>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-viverblue to-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentPhase + 1) / phases.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="space-y-6"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: 2
                }}
                className="flex justify-center"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">
                  🎉 Trilha personalizada pronta!
                </h3>
                <p className="text-gray-300 text-lg">
                  Sua jornada de implementação de IA foi criada com sucesso!
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <p className="text-sm text-gray-400">
                  Redirecionando automaticamente em alguns segundos...
                </p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Efeitos de partículas animadas */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-viverblue rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};
