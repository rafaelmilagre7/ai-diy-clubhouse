
import React from 'react';
import { Check, User, MessageCircle, Settings, CheckCircle } from 'lucide-react';

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

const getIconComponent = (iconName: string) => {
  const icons = {
    'user': User,
    'message-circle': MessageCircle,
    'settings': Settings,
    'check-circle': CheckCircle,
  };
  return icons[iconName as keyof typeof icons] || User;
};

export const ModernProgressIndicator = ({ steps, currentStep, onStepClick }: ModernProgressIndicatorProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 z-0">
          <div 
            className="h-full bg-[#0ABAB5] transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const IconComponent = getIconComponent(step.icon);
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && (index < currentStep || (index === currentStep + 1));

          return (
            <div 
              key={step.key} 
              className={`flex flex-col items-center relative z-10 ${isClickable ? 'cursor-pointer' : ''}`}
              onClick={() => isClickable && onStepClick(index)}
            >
              {/* Step Circle */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2
                ${isCompleted 
                  ? 'bg-[#0ABAB5] border-[#0ABAB5] text-white shadow-lg' 
                  : isCurrent 
                  ? 'bg-white border-[#0ABAB5] text-[#0ABAB5] shadow-md' 
                  : 'bg-white border-gray-200 text-gray-400'
                }
                ${isClickable ? 'hover:shadow-lg hover:scale-105' : ''}
              `}>
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <IconComponent className="h-5 w-5" />
                )}
              </div>

              {/* Step Content */}
              <div className="mt-3 text-center max-w-[120px]">
                <div className={`
                  text-sm font-medium transition-colors duration-200
                  ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}
                `}>
                  {step.title}
                </div>
                <div className={`
                  text-xs mt-1 transition-colors duration-200
                  ${isCompleted || isCurrent ? 'text-gray-500' : 'text-gray-400'}
                `}>
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
