
import React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

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
    <div className="mb-6 px-4 pt-6 pb-5 rounded-2xl shadow-lg glassmorphism bg-white/70 border border-[#0ABAB5]/10 transition-all">
      <div className="w-full flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            {/* Círculo do passo */}
            <div
              className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 text-base font-medium select-none",
                index < currentStep 
                  ? "bg-gradient-to-r from-green-500 to-green-400 border-green-400 text-white shadow"
                  : index === currentStep 
                    ? "bg-gradient-to-br from-[#0ABAB5] to-[#94fbf7] border-[#0ABAB5] text-white ring-2 ring-[#0ABAB5]/20 shadow-lg scale-110 z-10"
                    : "bg-neutral-100 border-neutral-200 text-neutral-400 shadow-none"
              )}
            >
              {index === 0 ? (
                // Não exibe texto/numero no primeiro (Landing)
                <span className={cn(
                  "w-full h-full flex items-center justify-center opacity-60"
                )}></span>
              ) : index < currentStep ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <span>{index + 1}</span>
              )}
              {/* Título do passo exceto o primeiro */}
              {index !== 0 && stepTitles[index] && (
                <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 whitespace-nowrap z-10">
                  <span 
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded",
                      index === currentStep ? "text-[#0ABAB5] bg-[#0ABAB5]/10 shadow" : "text-neutral-500"
                    )}
                  >
                    {stepTitles[index]}
                  </span>
                </div>
              )}
            </div>
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
    </div>
  );
};
