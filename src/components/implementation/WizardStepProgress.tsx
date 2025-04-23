
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface WizardStepProgressProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  onFinish?: () => void;
  isNextDisabled?: boolean;
  isPreviousDisabled?: boolean;
}

export const WizardStepProgress = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  isFirstStep = false,
  isLastStep = false,
  onFinish,
  isNextDisabled = false,
  isPreviousDisabled = false
}: WizardStepProgressProps) => {
  return (
    <div className="flex justify-between mt-8 pt-4 border-t">
      {!isFirstStep ? (
        <Button 
          variant="outline"
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
      ) : (
        <div /> 
      )}
      
      <div className="flex space-x-3">
        <Button
          variant="secondary"
          onClick={onComplete}
          className="flex items-center"
        >
          <Check className="mr-2 h-4 w-4" />
          Concluir módulo
        </Button>
        
        {isLastStep && onFinish && (
          <Button
            variant="default"
            onClick={onFinish}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            Finalizar implementação
          </Button>
        )}
        
        {!isLastStep && (
          <Button 
            variant="default" 
            onClick={onNext}
            disabled={isNextDisabled}
            className="flex items-center bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            Próximo
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
