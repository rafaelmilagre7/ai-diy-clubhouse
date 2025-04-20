
import React from "react";
import { CheckCircle, Circle } from "lucide-react";

interface EtapasProgressoProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

export const EtapasProgresso = ({ 
  currentStep, 
  totalSteps, 
  onStepClick 
}: EtapasProgressoProps) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center w-full relative">
        {/* Linha de progresso */}
        <div className="absolute h-1 bg-gray-200 top-1/2 left-0 -translate-y-1/2 w-full z-0"></div>
        <div 
          className="absolute h-1 bg-[#0ABAB5] top-1/2 left-0 -translate-y-1/2 z-0"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>

        {/* Indicadores de etapas */}
        {steps.map((step) => (
          <div 
            key={step} 
            onClick={() => onStepClick && onStepClick(step - 1)}
            className={`relative z-10 flex flex-col items-center ${
              onStepClick ? "cursor-pointer" : ""
            }`}
          >
            <div className={`rounded-full flex items-center justify-center w-8 h-8 
              ${step <= currentStep 
                ? "bg-[#0ABAB5] text-white" 
                : "bg-white border-2 border-gray-200 text-gray-400"}`}>
              {step < currentStep ? (
                <CheckCircle size={18} />
              ) : (
                <span className="text-sm font-medium">{step}</span>
              )}
            </div>
            <span className={`text-xs mt-1 ${
              step <= currentStep ? "text-[#0ABAB5] font-medium" : "text-gray-400"
            }`}>
              Etapa {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
