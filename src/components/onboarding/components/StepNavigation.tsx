
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Skip } from 'lucide-react';

interface StepNavigationProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  isLoading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
}

/**
 * Componente de navegação entre steps do onboarding
 * FASE 3: Controles de navegação do wizard
 */
export const StepNavigation: React.FC<StepNavigationProps> = ({
  canGoPrevious,
  canGoNext,
  isLastStep,
  isLoading = false,
  onPrevious,
  onNext,
  onSkip,
  onComplete
}) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
      {/* Botão Anterior */}
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoPrevious || isLoading}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </Button>

      {/* Botão Pular (opcional) */}
      {onSkip && !isLastStep && (
        <Button
          variant="ghost"
          onClick={onSkip}
          disabled={isLoading}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
        >
          <Skip className="w-4 h-4" />
          Pular Setup
        </Button>
      )}

      {/* Botão Próximo/Concluir */}
      {isLastStep ? (
        <Button
          onClick={onComplete}
          disabled={isLoading}
          className="flex items-center gap-2 bg-viverblue hover:bg-viverblue/90"
        >
          {isLoading ? 'Salvando...' : 'Concluir Setup'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className="flex items-center gap-2 bg-viverblue hover:bg-viverblue/90"
        >
          Próximo
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
