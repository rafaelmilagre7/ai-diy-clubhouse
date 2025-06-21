
import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  key: string;
  title: string;
  icon: string;
  description: string;
}

interface ModernProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export const ModernProgressIndicator = ({ steps, currentStep, onStepClick }: ModernProgressIndicatorProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-neutral-700 z-0">
          <div 
            className="h-full bg-[#0ABAB5] transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index <= currentStep;

          return (
            <div 
              key={step.key} 
              className={`flex flex-col items-center relative z-10 flex-1 ${isClickable ? 'cursor-pointer' : ''}`}
              onClick={() => isClickable && onStepClick(index)}
            >
              {/* Step Circle */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2
                ${isCompleted 
                  ? 'bg-[#0ABAB5] border-[#0ABAB5] text-white' 
                  : isCurrent 
                  ? 'bg-[#0ABAB5] border-[#0ABAB5] text-white' 
                  : 'bg-[#1A1E2E] border-neutral-600 text-neutral-400'
                }
                ${isClickable ? 'hover:scale-105' : ''}
              `}>
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="mt-3 text-center max-w-[120px]">
                <div className={`
                  text-xs font-medium transition-colors duration-200
                  ${isCompleted || isCurrent ? 'text-white' : 'text-neutral-500'}
                `}>
                  {step.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
