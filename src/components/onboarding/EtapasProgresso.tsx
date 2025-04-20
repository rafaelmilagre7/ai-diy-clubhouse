
import React from "react";
import { useNavigate } from "react-router-dom";

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

// Mapeamento das etapas para as rotas correspondentes
const etapasRoutes = [
  "/onboarding",
  "/onboarding/business-goals",
  "/onboarding/business-context",
  "/onboarding/ai-connection",
  "/onboarding/expectations",
  "/onboarding/personalization",
  "/onboarding/complementary",
];

export const EtapasProgresso = ({ currentStep, totalSteps }: EtapasProgressoProps) => {
  const navigate = useNavigate();

  // Função para navegar para uma etapa anterior
  const handleStepClick = (stepNumber: number) => {
    // Impedir navegação para etapas futuras ou para a própria etapa atual
    if (stepNumber >= currentStep) return;
    
    // Navegar para a etapa clicada
    navigate(etapasRoutes[stepNumber - 1]);
  };

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
          const isClickable = stepNumber < currentStep;
          
          return (
            <div 
              className={`flex-1 flex flex-col items-center ${isClickable ? 'cursor-pointer' : ''}`} 
              key={etapa}
              onClick={() => isClickable && handleStepClick(stepNumber)}
            >
              <div className={`rounded-full 
                flex items-center justify-center 
                h-8 w-8
                ${isCurrent
                  ? "bg-[#0ABAB5] text-white border-2 border-[#0ABAB5]"
                  : isDone
                    ? "bg-green-100 text-green-600 border-2 border-green-200"
                    : "bg-gray-200 text-gray-400 border-2 border-gray-200"}
                ${isClickable ? 'hover:brightness-95' : ''}
                font-bold transition-all`}>
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
