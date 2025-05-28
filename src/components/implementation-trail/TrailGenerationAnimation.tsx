
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, Target, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TrailGenerationAnimationProps {
  isGenerating: boolean;
  onComplete: () => void;
}

const generationSteps = [
  {
    icon: Target,
    text: "Analisando seu perfil e objetivos...",
    duration: 2000
  },
  {
    icon: Zap,
    text: "Encontrando soluções ideais para seu negócio...",
    duration: 2500
  },
  {
    icon: BookOpen,
    text: "Selecionando aulas recomendadas...",
    duration: 2000
  },
  {
    icon: Sparkles,
    text: "Personalizando suas recomendações...",
    duration: 2500
  }
];

export const TrailGenerationAnimation: React.FC<TrailGenerationAnimationProps> = ({
  isGenerating,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isGenerating) return;

    const runSteps = async () => {
      for (let i = 0; i < generationSteps.length; i++) {
        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, generationSteps[i].duration));
      }
      
      setCompleted(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    };

    runSteps();
  }, [isGenerating, onComplete]);

  if (!isGenerating) return null;

  return (
    <Card className="bg-gradient-to-br from-viverblue/10 via-transparent to-viverblue/5 border-viverblue/20">
      <CardContent className="pt-8 pb-8">
        <div className="text-center space-y-8">
          {/* Título principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h2 className="text-2xl font-bold text-viverblue">
              Gerando sua Trilha Personalizada
            </h2>
            <p className="text-neutral-400">
              Criando recomendações únicas baseadas no seu perfil
            </p>
          </motion.div>

          {/* Área de animação central */}
          <div className="relative h-32 flex items-center justify-center">
            {/* Círculo de fundo animado */}
            <motion.div
              className="absolute w-24 h-24 rounded-full border-2 border-viverblue/30"
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            
            {/* Ícone do step atual */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                {React.createElement(generationSteps[currentStep]?.icon || Sparkles, {
                  className: "h-12 w-12 text-viverblue"
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Texto do step atual */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-lg text-white font-medium"
            >
              {completed ? "Trilha personalizada criada com sucesso!" : generationSteps[currentStep]?.text}
            </motion.p>
          </AnimatePresence>

          {/* Indicador de progresso */}
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-between mb-2">
              {generationSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-viverblue' : 'bg-neutral-600'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: index <= currentStep ? 1 : 0.7,
                    backgroundColor: index <= currentStep ? '#0ABAB5' : '#525252'
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
            
            <motion.div 
              className="w-full bg-neutral-700 rounded-full h-2"
            >
              <motion.div
                className="bg-gradient-to-r from-viverblue to-viverblue/80 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((currentStep + 1) / generationSteps.length) * 100}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          </div>

          {/* Efeito de partículas */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-viverblue/40 rounded-full"
                animate={{
                  x: [0, Math.random() * 400 - 200],
                  y: [0, Math.random() * 300 - 150],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
                style={{
                  left: '50%',
                  top: '50%'
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
