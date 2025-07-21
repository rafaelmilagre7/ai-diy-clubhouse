
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
    <div className="w-full">
      {/* Mobile Progress Bar */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-600">
            Progresso
          </span>
          <span className="text-sm text-neutral-500">
            {currentStep + 1} de {totalSteps}
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-viverblue h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-center">
          <span className="text-sm font-medium text-neutral-800">
            {stepTitles[currentStep]}
          </span>
        </div>
      </div>

      {/* Desktop Horizontal Steps */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const isCompleted = i < currentStep;
            const isActive = i === currentStep;
            const isClickable = i <= currentStep;
            
            return (
              <React.Fragment key={i}>
                {/* Step Circle */}
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(i)}
                  disabled={!isClickable}
                  className={cn(
                    "relative flex flex-col items-center group transition-all duration-300",
                    isClickable ? "cursor-pointer hover:scale-105" : "cursor-not-allowed"
                  )}
                >
                  {/* Circle */}
                  <div
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-sm",
                      isCompleted
                        ? "border-viverblue bg-viverblue text-white shadow-viverblue/25"
                        : isActive
                        ? "border-viverblue bg-white text-viverblue shadow-viverblue/25 ring-4 ring-viverblue/10"
                        : "border-neutral-300 bg-white text-neutral-400"
                    )}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{i + 1}</span>
                    )}
                  </div>
                  
                  {/* Step Title */}
                  <div className="mt-3 text-center max-w-24">
                    <span
                      className={cn(
                        "text-xs font-medium transition-colors duration-300",
                        isActive 
                          ? "text-viverblue" 
                          : isCompleted
                          ? "text-neutral-700"
                          : "text-neutral-500"
                      )}
                    >
                      {stepTitles[i]}
                    </span>
                  </div>
                  
                  {/* Active Step Glow */}
                  {isActive && (
                    <div className="absolute -inset-2 bg-viverblue/5 rounded-full blur-sm" />
                  )}
                </button>
                
                {/* Connector Line */}
                {i < totalSteps - 1 && (
                  <div className="flex-1 h-0.5 mx-4 relative">
                    <div className="absolute inset-0 bg-neutral-200 rounded-full" />
                    <div
                      className={cn(
                        "absolute inset-0 bg-viverblue rounded-full transition-all duration-500",
                        i < currentStep ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WizardProgress;
