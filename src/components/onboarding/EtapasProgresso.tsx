
import React from "react";

interface EtapasProgressoProps {
  currentStep: number; // começa em 1
  totalSteps: number;
}

const etapas = [
  "Dados Pessoais",
  "Dados Profissionais",
  "Contexto do Negócio",
  "Conexão com IA",
  "Expectativas",
  "Personalização",
  "Complementar",
];

export const EtapasProgresso = ({ currentStep, totalSteps }: EtapasProgressoProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center mb-3 justify-between">
        <span className="text-sm text-gray-700 font-medium">
          Etapa {currentStep} de {totalSteps}
        </span>
        <span className="text-xs text-gray-400 tracking-wide">
          {((currentStep / totalSteps) * 100).toFixed(0)}% Concluído
        </span>
      </div>

      <div className="flex items-center justify-between gap-1">
        {etapas.map((etapa, idx) => {
          const stepNumber = idx + 1;
          const isDone = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;
          return (
            <div className="flex-1 flex flex-col items-center" key={etapa}>
              <div className={`rounded-full 
                flex items-center justify-center 
                h-8 w-8
                ${isCurrent
                  ? "bg-[#0ABAB5] text-white border-2 border-[#0ABAB5]"
                  : isDone
                    ? "bg-green-100 text-green-600 border-2 border-green-200"
                    : "bg-gray-200 text-gray-400 border-2 border-gray-200"}
                font-bold`}>
                {stepNumber}
              </div>
              <span className={`text-xs mt-1 text-center 
                ${isCurrent ? 'font-semibold text-[#0ABAB5]' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                {etapa}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
