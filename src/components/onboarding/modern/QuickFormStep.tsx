
import React from 'react';
import { Card } from '@/components/ui/card';

interface QuickFormStepProps {
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious?: () => void;
  canProceed: boolean;
  showBack?: boolean;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400">{description}</p>
          <div className="mt-4">
            <div className="flex justify-center items-center gap-2 mb-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i + 1 <= currentStep ? 'bg-viverblue' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Etapa {currentStep} de {totalSteps}
            </p>
          </div>
        </div>
        
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <div className="p-8">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};
