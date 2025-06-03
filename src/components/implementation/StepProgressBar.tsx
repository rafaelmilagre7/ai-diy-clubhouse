
import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepProgressBarProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  steps,
  currentStep,
  completedSteps,
  className = ""
}) => {
  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index);
        const isActive = currentStep === index;
        
        return (
          <React.Fragment key={index}>
            <div 
              className={cn(
                "progress-step",
                isCompleted && "completed",
                isActive && !isCompleted && "active"
              )}
              title={step}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "progress-line",
                  isCompleted && "completed"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
