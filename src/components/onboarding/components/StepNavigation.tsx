
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SkipForward, CheckCircle } from 'lucide-react';

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
 * FASE 5: Navegação aprimorada com validações
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
    <div className="flex justify-between items-center pt-8 border-t border-gray-200 mt-8">
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
      <div className="flex items-center gap-3">
        {onSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={isLoading}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <SkipForward className="w-4 h-4" />
            Pular Setup
          </Button>
        )}

        {/* Botão Próximo/Concluir */}
        {isLastStep ? (
          <Button
            onClick={onComplete}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-viverblue hover:from-green-600 hover:to-viverblue/90 text-white px-8"
          >
            {isLoading ? (
              'Salvando...'
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Concluir Setup
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canGoNext || isLoading}
            className="flex items-center gap-2 bg-viverblue hover:bg-viverblue/90 px-6"
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
