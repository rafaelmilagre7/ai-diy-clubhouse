
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
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-neutral-200 shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Previous Button */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className={cn(
                "flex items-center gap-2 min-w-[100px]",
                canGoPrevious 
                  ? "text-neutral-700 border-neutral-300 hover:bg-neutral-50" 
                  : "text-neutral-400 border-neutral-200 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              {currentStep === 1 ? "Voltar" : "Anterior"}
            </Button>
            
            {/* Step Counter - Mobile */}
            <div className="md:hidden text-sm text-neutral-500">
              {currentStep} de {totalSteps}
            </div>
          </div>
          
          {/* Next Button */}
          <div className="flex items-center space-x-4">
            {/* Progress Info - Desktop */}
            <div className="hidden md:block text-sm text-neutral-500">
              Etapa {currentStep} de {totalSteps}
            </div>
            
            {!canGoNext && !isLastStep && (
              <p className="text-sm text-neutral-400 hidden sm:block">
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
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
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
