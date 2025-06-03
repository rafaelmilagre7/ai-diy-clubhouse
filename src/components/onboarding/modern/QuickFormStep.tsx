
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  onNext,
  onPrevious,
  canProceed,
  showBack = false,
  children
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header com progresso */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <span className="text-sm text-gray-400">
            {currentStep} de {totalSteps}
          </span>
        </div>
        <p className="text-gray-300 mb-6">{description}</p>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Conteúdo do formulário */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
        <div className="space-y-6">
          {children}
        </div>

        {/* Botões de navegação */}
        <div className="flex justify-between mt-8">
          {showBack && onPrevious ? (
            <Button
              variant="outline"
              onClick={onPrevious}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
          ) : (
            <div></div>
          )}

          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="flex items-center space-x-2 bg-viverblue hover:bg-viverblue/90"
          >
            <span>Continuar</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
