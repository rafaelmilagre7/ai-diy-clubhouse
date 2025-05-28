
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Brain, Target, Sparkles } from 'lucide-react';

interface ModernTrailAnimationProps {
  onComplete: () => void;
}

export const ModernTrailAnimation: React.FC<ModernTrailAnimationProps> = ({ onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const phases = [
    {
      icon: Brain,
      title: "Analisando seu perfil",
      subtitle: "Processando suas informações e objetivos",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Target,
      title: "Mapeando soluções",
      subtitle: "Identificando oportunidades de IA para seu negócio",
      color: "from-purple-600 to-viverblue"
    },
    {
      icon: Sparkles,
      title: "Criando sua trilha",
      subtitle: "Personalizando recomendações e networking",
      color: "from-viverblue to-green-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1500);
          return 100;
        }
        return prev + 1.5;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const phaseIndex = Math.min(Math.floor(progress / 33.33), phases.length - 1);
    setCurrentPhase(phaseIndex);
  }, [progress, phases.length]);

  const currentPhaseData = phases[currentPhase];

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12">
      <motion.div
        className="text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Ícone animado central */}
        <div className="relative flex items-center justify-center">
          <motion.div
            className={`w-24 h-24 rounded-full bg-gradient-to-r ${currentPhaseData.color} p-1`}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
              <motion.div
                key={currentPhase}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                <currentPhaseData.icon className="w-10 h-10 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Partículas ao redor */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-viverblue rounded-full"
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, Math.cos(i * 45 * Math.PI / 180) * 60],
                y: [0, Math.sin(i * 45 * Math.PI / 180) * 60],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* Texto da fase atual */}
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-bold text-white">
            {currentPhaseData.title}
          </h2>
          <p className="text-gray-400">
            {currentPhaseData.subtitle}
          </p>
        </motion.div>

        {/* Barra de progresso moderna */}
        <div className="space-y-3">
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${currentPhaseData.color} rounded-full`}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <motion.p
              className="text-viverblue font-semibold text-lg"
              animate={{ scale: progress >= 100 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              {Math.round(progress)}%
            </motion.p>
            
            {progress >= 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 text-green-400"
              >
                <Zap className="w-5 h-5" />
                <span className="font-semibold">Concluído!</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Status de conclusão */}
        {progress >= 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center space-x-2 text-green-400"
              >
                <Target className="w-5 h-5" />
                <span>Trilha de Implementação Criada</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center justify-center space-x-2 text-blue-400"
              >
                <Sparkles className="w-5 h-5" />
                <span>Networking Inteligente Ativado</span>
              </motion.div>
            </div>
            
            <p className="text-gray-300 text-sm">
              Redirecionando para sua experiência personalizada...
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
