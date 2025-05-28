
import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingStepWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
}

export const OnboardingStepWrapper: React.FC<OnboardingStepWrapperProps> = ({
  children,
  title,
  subtitle,
  currentStep,
  totalSteps
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      {/* Indicador de progresso */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-400">
            Etapa {currentStep} de {totalSteps}
          </span>
          <span className="text-sm text-gray-400">
            {Math.round((currentStep / totalSteps) * 100)}% concluído
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-viverblue to-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        {subtitle && (
          <p className="text-gray-400 text-lg">{subtitle}</p>
        )}
      </div>

      {/* Conteúdo */}
      {children}
    </motion.div>
  );
};
