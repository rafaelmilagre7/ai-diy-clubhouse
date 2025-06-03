
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgressIndicatorEnhancedProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
  analytics?: {
    timeSpent: number;
  };
}

export const ProgressIndicatorEnhanced: React.FC<ProgressIndicatorEnhancedProps> = ({
  currentStep,
  totalSteps,
  stepTitles = ['Quem é você', 'Seu negócio', 'Experiência IA', 'Trilha'],
  analytics
}) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return minutes > 0 ? `${minutes}m` : '<1m';
  };

  return (
    <div className="space-y-6">
      {/* Barra de progresso principal */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-white">
            Etapa {currentStep} de {totalSteps}
          </span>
          {analytics && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {formatTime(analytics.timeSpent)}
            </div>
          )}
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-gray-700"
        />
      </div>

      {/* Indicadores de etapas */}
      <div className="flex justify-between relative">
        {/* Linha conectora */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-700 -z-10" />
        <motion.div 
          className="absolute top-3 left-0 h-0.5 bg-viverblue -z-10"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
        
        {stepTitles.slice(0, totalSteps).map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center space-y-2">
              <motion.div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold relative ${
                  isCompleted 
                    ? 'bg-viverblue text-white' 
                    : isCurrent
                    ? 'bg-viverblue/20 border-2 border-viverblue text-viverblue'
                    : 'bg-gray-700 text-gray-400'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span>{stepNumber}</span>
                )}
                
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-viverblue"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              
              <span className={`text-xs text-center max-w-16 ${
                isCurrent ? 'text-viverblue font-medium' : 'text-gray-400'
              }`}>
                {title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
