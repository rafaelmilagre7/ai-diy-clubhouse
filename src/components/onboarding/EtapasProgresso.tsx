
import React from "react";
import { cn } from "@/lib/utils";

interface EtapasProgressoProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

export const EtapasProgresso: React.FC<EtapasProgressoProps> = ({
  currentStep,
  totalSteps = 9, // Atualizado para 9 etapas
  onStepClick,
}) => {
  const etapas = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {etapas.map((etapa) => (
          <React.Fragment key={etapa}>
            <div
              className={cn(
                "relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-all",
                currentStep >= etapa
                  ? "border-[#0ABAB5] bg-[#0ABAB5] text-white hover:bg-[#0ABAB5]/90"
                  : "border-gray-300 bg-white text-gray-500 hover:border-gray-400"
              )}
              onClick={() => onStepClick && onStepClick(etapa)}
            >
              <span className="text-xs font-semibold">{etapa}</span>
            </div>
            {etapa < totalSteps && (
              <div
                className={cn(
                  "h-0.5 flex-1",
                  currentStep > etapa ? "bg-[#0ABAB5]" : "bg-gray-300"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
