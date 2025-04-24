
import React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WizardStepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick?: (stepIdx: number) => void;
}

export const WizardStepProgress = ({
  currentStep,
  totalSteps,
  stepTitles,
  onStepClick
}: WizardStepProgressProps) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <TooltipProvider>
      <div className="relative px-4 py-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative flex items-center justify-between">
          {/* Linha de progresso base */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full" />
          {/* Linha de progresso preenchida */}
          <div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#0ABAB5] rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />

          {/* Pontos/Etapas */}
          {steps.map((step) => {
            const isComplete = step < currentStep;
            const isActive = step === currentStep;
            const isClickable = typeof onStepClick === "function";
            return (
              <Tooltip key={step}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 select-none",
                      isClickable && !isActive ? "cursor-pointer hover:scale-110" : "",
                      isComplete
                        ? "bg-green-500 text-white shadow-sm"
                        : isActive
                        ? "bg-[#0ABAB5] text-white ring-4 ring-[#0ABAB5]/20 shadow-lg scale-110"
                        : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-400"
                    )}
                    onClick={() => {
                      if (isClickable && !isActive && onStepClick) {
                        onStepClick(step - 1);
                      }
                    }}
                  >
                    {isComplete ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step}</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-[#0ABAB5] text-white font-medium border-none"
                >
                  {stepTitles[step - 1]}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Etapas em tela pequena */}
        <div className="mt-4 grid grid-cols-2 gap-2 md:hidden">
          {steps.map((step) => {
            const isComplete = step < currentStep;
            const isActive = step === currentStep;

            return (
              <div
                key={step}
                className={cn(
                  "text-xs px-2 py-1 rounded",
                  isComplete
                    ? "text-green-600 dark:text-green-400"
                    : isActive
                    ? "text-[#0ABAB5] font-medium"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                {step}. {stepTitles[step - 1]}
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
