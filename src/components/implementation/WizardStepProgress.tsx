
import React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WizardStepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

export const WizardStepProgress = ({
  currentStep,
  totalSteps,
  stepTitles = [],
}: WizardStepProgressProps) => {
  // Array de etapas
  const steps = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <TooltipProvider>
      <div className="mb-4 px-4 py-3 rounded-xl shadow-md bg-white/80 border border-[#0ABAB5]/10 transition-all">
        {/* Versão desktop - mostra todos os passos */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              {/* Círculo do passo */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 text-xs font-medium",
                      index < currentStep 
                        ? "bg-gradient-to-r from-green-500 to-green-400 border-green-400 text-white shadow-sm"
                        : index === currentStep 
                          ? "bg-gradient-to-br from-[#0ABAB5] to-[#94fbf7] border-[#0ABAB5] text-white ring-2 ring-[#0ABAB5]/20 shadow-lg scale-110 z-10"
                          : "bg-neutral-100 border-neutral-200 text-neutral-400"
                    )}
                  >
                    {index < currentStep ? (
                      <CheckIcon className="w-3.5 h-3.5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                </TooltipTrigger>
                {stepTitles[index] && (
                  <TooltipContent side="bottom" className="bg-[#0ABAB5] text-white text-xs">
                    {stepTitles[index]}
                  </TooltipContent>
                )}
              </Tooltip>
              
              {/* Linha conectora */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-1 transition-colors duration-300 rounded-full",
                    index < currentStep ? "bg-gradient-to-r from-green-400 to-green-200" : "bg-neutral-200"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Versão mobile - mostra todos os passos de forma compacta */}
        <div className="flex md:hidden items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              {/* Círculo do passo em versão compacta */}
              <div
                className={cn(
                  "relative flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-300 text-xs",
                  index < currentStep 
                    ? "bg-green-500 border-green-400 text-white"
                    : index === currentStep 
                      ? "bg-[#0ABAB5] border-[#0ABAB5] text-white ring-1 ring-[#0ABAB5]/20 scale-105"
                      : "bg-neutral-100 border-neutral-200 text-neutral-400"
                )}
              >
                {index < currentStep ? (
                  <CheckIcon className="w-3 h-3" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              {/* Linha conectora para mobile */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-0.5 transition-colors duration-300 rounded-full",
                    index < currentStep ? "bg-green-400" : "bg-neutral-200"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};
