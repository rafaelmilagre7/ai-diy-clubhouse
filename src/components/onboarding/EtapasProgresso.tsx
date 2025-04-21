
import React from "react";
import { steps } from "@/hooks/onboarding/useStepDefinitions";
import { cn } from "@/lib/utils";

interface EtapasProgressoProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

export const EtapasProgresso = ({
  currentStep,
  totalSteps,
  onStepClick,
}: EtapasProgressoProps) => {
  // Filtramos os passos para excluir o passo de geração de trilha que é uma etapa diferente
  const visibleSteps = steps.filter(step => step.id !== "trail_generation");
  
  // Ajustamos totalSteps para corresponder ao número de passos visíveis
  const effectiveTotalSteps = Math.min(totalSteps, visibleSteps.length);
  
  return (
    <div className="w-full mt-6">
      <div className="flex justify-between relative">
        {/* Linha de progresso entre os círculos */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
        
        {Array.from({ length: effectiveTotalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center relative z-10 cursor-pointer transition-all duration-200",
                onStepClick ? "cursor-pointer hover:opacity-80" : ""
              )}
              onClick={() => onStepClick && onStepClick(stepNumber)}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-[#0ABAB5] text-white shadow-md"
                    : "bg-gray-200 text-gray-600",
                  isCurrent
                    ? "ring-4 ring-[#0ABAB5]/20"
                    : ""
                )}
              >
                {stepNumber}
              </div>
              
              {/* Nome do passo (visível apenas para etapa atual e concluídas) */}
              <span
                className={cn(
                  "text-xs mt-2 font-medium transition-all duration-300 text-center max-w-[80px] line-clamp-2",
                  isActive ? "text-gray-700" : "text-gray-400"
                )}
              >
                {visibleSteps[index]?.title || `Passo ${stepNumber}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
