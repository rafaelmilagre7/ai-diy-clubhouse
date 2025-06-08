
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
}

export const OnboardingNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  canProceed
}: OnboardingNavigationProps) => {
  return (
    <div className="flex items-center justify-between">
      {/* Botão Voltar */}
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={currentStep === 1}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </Button>

      {/* Info central */}
      <div className="hidden sm:block text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Etapa {currentStep} de {totalSteps}
        </p>
      </div>

      {/* Botão Próximo */}
      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="flex items-center gap-2 bg-viverblue hover:bg-viverblue-dark"
      >
        {currentStep === totalSteps ? 'Finalizar' : 'Próximo'}
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
