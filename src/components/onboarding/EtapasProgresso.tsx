
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EtapasProgressoProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (stepIndex: number) => void;
}

export const EtapasProgresso: React.FC<EtapasProgressoProps> = ({
  currentStep,
  totalSteps,
  onStepClick
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full">
      <div className="relative flex justify-between items-center">
        {/* Linha de progresso base */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-700" />
        <div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#0ABAB5] transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep - 1) / (totalSteps - 1) * 100}%` }}
        />
        {steps.map((step, idx) => {
          const isComplete = step < currentStep;
          const isActive = step === currentStep;
          const isClickable = typeof onStepClick === 'function';

          return (
            <div
              key={step}
              className={cn(
                "relative z-10 flex flex-col items-center",
                isClickable && !isActive ? "cursor-pointer select-none hover:scale-110 transition-transform" : "",
              )}
              onClick={isClickable && !isActive ? () => onStepClick(idx) : undefined}
              aria-disabled={isActive || !isClickable}
              tabIndex={isClickable && !isActive ? 0 : -1}
              role={isClickable ? "button" : undefined}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
                  isComplete
                    ? "bg-[#0ABAB5]"
                    : isActive
                    ? "bg-[#0ABAB5]/20 border-2 border-[#0ABAB5]"
                    : "bg-gray-700"
                )}
              >
                {isComplete ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-white font-medium">{step}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
