
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  isLoading?: boolean;
}

export const OnboardingNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  canProceed,
  isLoading = false
}: OnboardingNavigationProps) => {
  return (
    <div className="flex items-center justify-between">
      {/* Botão Voltar */}
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={currentStep === 1 || isLoading}
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
        {!canProceed && (
          <p className="text-xs text-red-500 mt-1">
            Complete os campos obrigatórios
          </p>
        )}
      </div>

      {/* Botão Próximo */}
      <Button
        onClick={onNext}
        disabled={!canProceed || isLoading}
        className="flex items-center gap-2 bg-viverblue hover:bg-viverblue-dark disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            {currentStep === totalSteps ? 'Finalizar' : 'Próximo'}
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
};
