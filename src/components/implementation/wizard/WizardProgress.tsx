
import React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  onStepClick,
  completedSteps = [],
}) => {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isCompleted = completedSteps.includes(i);
          const isActive = i === currentStep;
          const canClick = i <= currentStep || isCompleted;
          
          return (
            <React.Fragment key={i}>
              {/* Etapa */}
              <button
                type="button"
                onClick={() => canClick && onStepClick?.(i)}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 text-sm font-medium",
                  isCompleted
                    ? "border-green-500 bg-green-500 text-white shadow-lg"
                    : isActive
                    ? "border-viverblue bg-viverblue text-white shadow-lg scale-110"
                    : canClick
                    ? "border-neutral-300 bg-white text-neutral-600 hover:border-viverblue hover:text-viverblue"
                    : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                )}
                disabled={!canClick}
              >
                {isCompleted ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <span>{i + 1}</span>
                )}
                
                {/* Título da etapa */}
                <span
                  className={cn(
                    "absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs max-w-20 truncate",
                    isActive 
                      ? "font-medium text-white" 
                      : isCompleted
                      ? "text-green-400"
                      : "text-neutral-400"
                  )}
                  title={stepTitles[i]}
                >
                  {stepTitles[i]}
                </span>
              </button>
              
              {/* Linha conectora entre etapas */}
              {i < totalSteps - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-full max-w-[5rem] flex-1 transition-colors duration-300",
                    i < currentStep || isCompleted
                      ? "bg-green-500"
                      : "bg-neutral-300"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
