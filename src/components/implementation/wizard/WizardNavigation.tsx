
import React from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WizardNavigationProps {
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  canGoNext,
  canGoPrevious,
  isLastStep,
  onNext,
  onPrevious,
  currentStep,
  totalSteps
}) => {
  return (
    <div className="border-t border-neutral-800 bg-slate-900/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className={cn(
                "flex items-center gap-2",
                canGoPrevious 
                  ? "text-white border-neutral-600 hover:bg-neutral-800" 
                  : "text-neutral-500 border-neutral-700"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              {currentStep === 1 ? "Voltar à Solução" : "Anterior"}
            </Button>
            
            <div className="text-sm text-neutral-400">
              Etapa {currentStep} de {totalSteps}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {!canGoNext && !isLastStep && (
              <p className="text-sm text-neutral-400">
                Complete esta etapa para continuar
              </p>
            )}
            
            <Button
              onClick={onNext}
              disabled={!canGoNext}
              className={cn(
                "flex items-center gap-2 min-w-[120px]",
                canGoNext
                  ? "bg-viverblue hover:bg-viverblue/90 text-white"
                  : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
              )}
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Finalizar
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
