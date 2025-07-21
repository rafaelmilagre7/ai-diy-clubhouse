
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
    <div className="w-full">
      {/* Desktop Version - Full horizontal layout */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between w-full">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const isCompleted = completedSteps.includes(i);
            const isActive = i === currentStep;
            const canClick = i <= currentStep || isCompleted;
            
            return (
              <React.Fragment key={i}>
                {/* Step Circle */}
                <div className="flex flex-col items-center flex-1">
                  <button
                    type="button"
                    onClick={() => canClick && onStepClick?.(i)}
                    className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 text-sm font-medium mb-3",
                      isCompleted
                        ? "border-green-500 bg-green-500 text-white shadow-lg scale-105"
                        : isActive
                        ? "border-viverblue bg-viverblue text-white shadow-lg scale-110"
                        : canClick
                        ? "border-neutral-300 bg-white text-neutral-600 hover:border-viverblue hover:text-viverblue hover:scale-105"
                        : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    )}
                    disabled={!canClick}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-6 w-6" />
                    ) : (
                      <span className="text-base font-semibold">{i + 1}</span>
                    )}
                  </button>
                  
                  {/* Step Title */}
                  <div className="text-center max-w-24">
                    <span
                      className={cn(
                        "text-sm font-medium leading-tight",
                        isActive 
                          ? "text-viverblue" 
                          : isCompleted
                          ? "text-green-600"
                          : canClick
                          ? "text-neutral-700"
                          : "text-neutral-400"
                      )}
                      title={stepTitles[i]}
                    >
                      {stepTitles[i]}
                    </span>
                  </div>
                </div>
                
                {/* Connector Line */}
                {i < totalSteps - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mb-8">
                    <div
                      className={cn(
                        "h-full transition-colors duration-300",
                        isCompleted
                          ? "bg-green-500"
                          : i < currentStep
                          ? "bg-viverblue"
                          : "bg-neutral-300"
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile Version - Compact horizontal layout */}
      <div className="block md:hidden">
        <div className="flex items-center justify-between w-full px-2">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const isCompleted = completedSteps.includes(i);
            const isActive = i === currentStep;
            const canClick = i <= currentStep || isCompleted;
            
            return (
              <React.Fragment key={i}>
                {/* Compact Step */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => canClick && onStepClick?.(i)}
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 text-xs font-medium mb-2",
                      isCompleted
                        ? "border-green-500 bg-green-500 text-white shadow-md"
                        : isActive
                        ? "border-viverblue bg-viverblue text-white shadow-md scale-110"
                        : canClick
                        ? "border-neutral-300 bg-white text-neutral-600"
                        : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    )}
                    disabled={!canClick}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <span className="text-xs">{i + 1}</span>
                    )}
                  </button>
                  
                  {/* Compact Title */}
                  <span
                    className={cn(
                      "text-xs text-center max-w-12 leading-tight",
                      isActive 
                        ? "text-viverblue font-medium" 
                        : isCompleted
                        ? "text-green-600"
                        : "text-neutral-500"
                    )}
                  >
                    {stepTitles[i]?.split(' ')[0] || `${i + 1}`}
                  </span>
                </div>
                
                {/* Mobile Connector */}
                {i < totalSteps - 1 && (
                  <div className="flex-1 h-0.5 mx-1 mb-6">
                    <div
                      className={cn(
                        "h-full transition-colors duration-300",
                        isCompleted
                          ? "bg-green-500"
                          : i < currentStep
                          ? "bg-viverblue"
                          : "bg-neutral-300"
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Current Step Title on Mobile */}
        <div className="text-center mt-4">
          <h3 className="text-sm font-semibold text-viverblue">
            {stepTitles[currentStep]}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Etapa {currentStep + 1} de {totalSteps}
          </p>
        </div>
      </div>
    </div>
  );
};
