
import React from "react";
import { cn } from "@/lib/utils";

interface WizardStepProgressProps {
  currentStep: number; // 0 baseado, para total de 8 módulos
  totalSteps?: number;
  stepTitles?: string[];
}

const defaultStepTitles = [
  "Landing",
  "Visão Geral",
  "Preparação",
  "Implementação",
  "Verificação",
  "Resultados",
  "Otimização",
  "Celebração"
];

export const WizardStepProgress: React.FC<WizardStepProgressProps> = ({
  currentStep,
  totalSteps = 8,
  stepTitles = defaultStepTitles
}) => {
  return (
    <div className={cn(
      "relative w-full py-7 px-4 flex flex-col items-center mb-8",
      "backdrop-blur-xl bg-white/30 dark:bg-[#1A1F2C]/50 rounded-2xl shadow-lg border border-white/10",
      "glass"
    )}>
      <div className="flex w-full items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const step = idx + 1;
          const active = idx === currentStep;
          const completed = idx < currentStep;
          return (
            <React.Fragment key={step}>
              <div
                className={cn(
                  "flex flex-col items-center z-10",
                  active
                    ? "text-[#0ABAB5] scale-110 transition-transform duration-200 font-bold"
                    : completed
                    ? "text-green-600"
                    : "text-gray-400"
                )}
              >
                <div className={cn(
                  "rounded-full w-9 h-9 flex items-center justify-center text-lg font-semibold border-2 mb-1 shadow",
                  active
                    ? "border-[#0ABAB5] bg-white"
                    : completed
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 bg-gray-100"
                )}>
                  {step}
                </div>
                <span className={cn(
                  "text-xs text-center leading-tight",
                  active ? "opacity-100" : "opacity-70"
                )}>
                  {stepTitles[idx]}
                </span>
              </div>
              {/* Conector */}
              {step < totalSteps && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-1 md:mx-2 rounded",
                    completed
                      ? "bg-gradient-to-r from-[#0ABAB5] to-green-300"
                      : "bg-gray-200"
                  )}
                  style={{ minWidth: 16 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
