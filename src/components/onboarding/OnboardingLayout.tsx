
import React from 'react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  currentStep: number;
  totalSteps: number;
  onBackClick?: () => void;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  currentStep,
  totalSteps
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
          
          <div className="flex justify-center items-center gap-2 mb-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i + 1 <= currentStep ? 'bg-viverblue' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <p className="text-sm text-gray-400">
            Etapa {currentStep} de {totalSteps}
          </p>
        </div>
        
        {children}
      </div>
    </div>
  );
};
