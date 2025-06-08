
import React from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const OnboardingProgress = ({ 
  currentStep, 
  totalSteps, 
  stepTitles 
}: OnboardingProgressProps) => {
  return (
    <div className="w-full">
      {/* Barra de progresso principal */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Progresso do Onboarding
          </span>
          <span className="text-sm font-medium text-viverblue">
            {currentStep} de {totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-viverblue to-viverblue-light h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Indicadores de etapas para desktop */}
      <div className="hidden md:flex items-center justify-between">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-300",
                  isCompleted 
                    ? "bg-viverblue border-viverblue text-white"
                    : isCurrent 
                      ? "border-viverblue bg-white dark:bg-gray-800 text-viverblue ring-2 ring-viverblue/20"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </div>
              <span className={cn(
                "mt-2 text-xs text-center font-medium",
                isCompleted || isCurrent 
                  ? "text-viverblue" 
                  : "text-gray-400"
              )}>
                {title}
              </span>
              
              {/* Linha conectora */}
              {index < stepTitles.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 -z-10">
                  <div 
                    className={cn(
                      "h-full transition-colors duration-300",
                      isCompleted ? "bg-viverblue" : "bg-gray-300 dark:bg-gray-600"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Indicador simples para mobile */}
      <div className="md:hidden text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {stepTitles[currentStep - 1]}
        </h3>
      </div>
    </div>
  );
};
