
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";

interface TrailMagicExperienceProps {
  onFinish: () => void;
}

export const TrailMagicExperience: React.FC<TrailMagicExperienceProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [magicParticles, setMagicParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const messages = [
    "Analisando seu perfil...",
    "Identificando soluções ideais...",
    "Personalizando recomendações...",
    "Organizando sua trilha...",
    "Quase pronto...",
  ];

  useEffect(() => {
    // Avançar os passos
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= messages.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            onFinish();
          }, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);

    // Gerar partículas mágicas
    const particleInterval = setInterval(() => {
      setMagicParticles(prev => {
        // Limitar a 20 partículas
        const particles = [...prev];
        if (particles.length > 20) {
          particles.shift();
        }
        
        // Adicionar nova partícula em posição aleatória
        return [
          ...particles,
          {
            id: Date.now(),
            x: Math.random() * 100, // Posição percentual X
            y: Math.random() * 100, // Posição percentual Y
          }
        ];
      });
    }, 300);

    return () => {
      clearInterval(interval);
      clearInterval(particleInterval);
    };
  }, [onFinish, messages.length]);

  return (
    <div className="relative h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#151823] to-[#1A1E2E] rounded-lg">
      {/* Partículas mágicas */}
      {magicParticles.map(particle => (
        <motion.div
          key={particle.id}
          initial={{ 
            opacity: 0.8, 
            scale: 0.5,
            top: `${particle.y}%`,
            left: `${particle.x}%`
          }}
          animate={{
            opacity: 0,
            scale: 1,
            y: -30,
          }}
          transition={{ duration: 2 }}
          className="absolute"
        >
          <Sparkles className="h-4 w-4 text-[#0ABAB5]" />
        </motion.div>
      ))}
      
      {/* Círculo central */}
      <motion.div 
        className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-br from-[#0ABAB5]/30 to-[#34D399]/10 flex items-center justify-center"
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Wand2 className="h-12 w-12 text-[#0ABAB5]" />
        </motion.div>
      </motion.div>
      
      {/* Mensagens */}
      <div className="absolute bottom-12 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="h-8 flex items-center justify-center"
          >
            <p className="text-[#0ABAB5] font-medium">{messages[currentStep]}</p>
          </motion.div>
        </AnimatePresence>
        
        <div className="mt-4 flex justify-center">
          <div className="flex gap-2">
            {messages.map((_, idx) => (
              <motion.div
                key={idx}
                className={`w-2 h-2 rounded-full ${idx === currentStep ? 'bg-[#0ABAB5]' : 'bg-neutral-600'}`}
                animate={idx === currentStep ? {
                  scale: [1, 1.5, 1],
                } : {}}
                transition={idx === currentStep ? {
                  duration: 1.5,
                  repeat: Infinity,
                } : {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
