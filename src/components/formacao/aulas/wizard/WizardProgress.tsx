
import React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick?: (step: number) => void;
}

const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  onStepClick,
}) => {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isCompleted = i < currentStep;
          const isActive = i === currentStep;
          
          return (
            <React.Fragment key={i}>
              {/* Etapa */}
              <button
                type="button"
                onClick={() => onStepClick?.(i)}
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                    ? "border-primary text-foreground"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
                disabled={!isCompleted && !isActive}
              >
                {isCompleted ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <span>{i + 1}</span>
                )}
                
                {/* Título da etapa */}
                <span
                  className={cn(
                    "absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs",
                    isActive ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {stepTitles[i]}
                </span>
              </button>
              
              {/* Linha conectora entre etapas */}
              {i < totalSteps - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-full max-w-progress-bar flex-1",
                    i < currentStep
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
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

export default WizardProgress;
