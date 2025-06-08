
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

/**
 * Barra de progresso visual do onboarding
 * FASE 3: Indicador de progresso do wizard
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  currentStep, 
  totalSteps, 
  className 
}) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">
          Progresso do Setup
        </span>
        <span className="text-sm text-gray-500">
          {currentStep + 1} de {totalSteps}
        </span>
      </div>
      <Progress 
        value={progressPercentage} 
        className="h-2 bg-gray-200"
        indicatorClassName="bg-viverblue transition-all duration-300"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Início</span>
        <span>Concluído</span>
      </div>
    </div>
  );
};
