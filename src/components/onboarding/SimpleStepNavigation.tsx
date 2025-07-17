import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SimpleStepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  isLoading?: boolean;
}

export const SimpleStepNavigation: React.FC<SimpleStepNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  canGoNext = true,
  canGoPrevious = true,
  isLoading = false
}) => {
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  const handleNext = () => {
    if (isLastStep && onComplete) {
      onComplete();
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <div className="flex items-center justify-between">
      {/* Previous Button */}
      <div>
        {!isFirstStep && onPrevious && (
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )}
      </div>

      {/* Next/Complete Button */}
      <div>
        <Button
          onClick={handleNext}
          disabled={!canGoNext || isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-sm">Sincronizando...</span>
            </>
          ) : isLastStep ? null : (
            <ChevronRight className="w-4 h-4 ml-2" />
          )}
          {isLoading 
            ? null // Texto já incluído acima
            : isLastStep 
            ? "Finalizar" 
            : "Continuar"
          }
        </Button>
      </div>
    </div>
  );
};