
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitles
}) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          Etapa {currentStep} de {totalSteps}
        </h2>
        <span className="text-sm text-slate-400">
          {Math.round(progressPercentage)}% concluído
        </span>
      </div>
      
      <Progress 
        value={progressPercentage} 
        className="h-2 mb-6 bg-slate-700"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div
              key={stepNumber}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                isCurrent 
                  ? 'bg-viverblue/20 border border-viverblue/30' 
                  : isCompleted 
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-slate-800/50 border border-slate-700'
              }`}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Circle 
                    className={`w-4 h-4 ${
                      isCurrent ? 'text-viverblue' : 'text-slate-500'
                    }`} 
                  />
                )}
              </div>
              <span 
                className={`text-xs font-medium truncate ${
                  isCurrent 
                    ? 'text-viverblue' 
                    : isCompleted 
                      ? 'text-green-400'
                      : 'text-slate-400'
                }`}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
