import React from 'react';
import { cn } from '@/lib/utils';

interface SimpleOnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const SimpleOnboardingProgress: React.FC<SimpleOnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitles
}) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          {stepTitles[currentStep - 1]}
        </h1>
        <span className="text-sm text-muted-foreground">
          {currentStep} de {totalSteps}
        </span>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div
              key={stepNumber}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                isCompleted && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary text-primary-foreground",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {stepNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
};