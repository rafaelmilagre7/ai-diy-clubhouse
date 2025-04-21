
import React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WizardStepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick?: (step: number) => void;
}

export const WizardStepProgress = ({
  currentStep,
  totalSteps,
  stepTitles,
  onStepClick
}: WizardStepProgressProps) => {
  // Gerar array de etapas
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  
  return (
    <TooltipProvider>
      <div className="mb-6 px-4 py-4 rounded-lg bg-white shadow-sm border border-[#0ABAB5]/10">
        <div className="relative flex items-center justify-between">
          {/* Linha de progresso base */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full" />
          
          {/* Linha de progresso preenchida */}
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#0ABAB5] rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
          
          {/* Pontos/Etapas */}
          {steps.map((step) => {
            const isComplete = step < currentStep;
            const isActive = step === currentStep;
            const isClickable = !!onStepClick;
            
            return (
              <Tooltip key={step}>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
                      isClickable && "cursor-pointer",
                      isComplete ? "bg-green-500 text-white" : 
                      isActive ? "bg-[#0ABAB5] text-white ring-4 ring-[#0ABAB5]/20" : 
                      "bg-white border-2 border-gray-200 text-gray-400"
                    )}
                    onClick={isClickable ? () => onStepClick(step) : undefined}
                  >
                    {isComplete ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step}</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-[#0ABAB5] text-white">
                  {stepTitles[step - 1]}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
