
import React from 'react';
import { Check } from 'lucide-react';
import { OnboardingStep } from '@/types/onboarding';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: OnboardingStep;
  totalSteps?: number;
  showLabels?: boolean;
}

const stepLabels = [
  'Boas-vindas',
  'Perfil Empresarial',
  'Maturidade em IA',
  'Objetivos',
  'Personalização',
];

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps = 5,
  showLabels = true,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              {/* Step circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  {
                    'bg-primary text-primary-foreground': isCompleted || isCurrent,
                    'bg-muted text-muted-foreground': isUpcoming,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>

              {/* Step label */}
              {showLabels && (
                <span
                  className={cn(
                    'text-xs mt-2 text-center max-w-20 leading-tight',
                    {
                      'text-primary font-medium': isCompleted || isCurrent,
                      'text-muted-foreground': isUpcoming,
                    }
                  )}
                >
                  {stepLabels[index]}
                </span>
              )}

              {/* Connector line */}
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    'absolute h-0.5 transform translate-y-5 transition-all duration-300',
                    'hidden md:block',
                    {
                      'bg-primary': stepNumber < currentStep,
                      'bg-muted': stepNumber >= currentStep,
                    }
                  )}
                  style={{
                    width: `calc(100% / ${totalSteps} - 2.5rem)`,
                    left: `calc(${(100 / totalSteps) * (index + 0.5)}% + 1.25rem)`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
