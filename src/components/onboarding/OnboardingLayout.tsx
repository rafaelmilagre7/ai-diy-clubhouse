
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  currentStep: number;
  totalSteps: number;
  onBackClick?: () => void;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  currentStep,
  totalSteps,
  onBackClick
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-[#0F111A] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header com logo e progresso */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-viverblue" />
            <h1 className="text-2xl font-bold text-viverblue">VIVER DE IA</h1>
          </div>
          
          {/* Barra de progresso */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-viverblue to-viverblue/80 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </motion.div>

        {/* Botão de voltar */}
        {onBackClick && (
          <div className="flex justify-start">
            <Button
              onClick={onBackClick}
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-gray-800 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        )}

        {/* Conteúdo principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};
