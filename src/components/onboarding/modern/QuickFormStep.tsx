
import React from 'react';

interface QuickFormStepProps {
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious?: () => void;
  canProceed: boolean;
  showBack: boolean;
  children: React.ReactNode;
}

export const QuickFormStep: React.FC<QuickFormStepProps> = ({
  title,
  description,
  currentStep,
  totalSteps,
  children
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i + 1 <= currentStep ? 'bg-viverblue' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400 text-lg">{description}</p>
        </div>
        
        {children}
      </div>
    </div>
  );
};
