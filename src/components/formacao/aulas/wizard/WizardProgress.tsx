
import React from 'react';
import { Check } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick: (step: number) => void;
}

const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  onStepClick
}) => {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <div className={`flex-1 h-0.5 ${index <= currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
              
              <button
                type="button"
                onClick={() => onStepClick(index)}
                className={`relative flex items-center justify-center w-8 h-8 rounded-full ${
                  isCompleted
                    ? 'bg-primary text-white'
                    : isCurrent
                    ? 'border-2 border-primary text-primary bg-white'
                    : 'bg-gray-200 text-gray-500'
                } transition-colors`}
                disabled={index > currentStep}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                
                <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-xs ${isCurrent ? 'font-medium' : 'text-gray-500'}`}>
                    {stepTitles[index]}
                  </span>
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WizardProgress;
