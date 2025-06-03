
import { useState } from "react";

export const useSolutionSteps = (initialStep: number = 0) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [activeTab, setActiveTab] = useState(getDefaultTabForStep(initialStep));

  const totalSteps = 7; // Número total de etapas no fluxo
  
  const stepTitles = [
    "Informações Básicas",
    "Ferramentas Necessárias",
    "Materiais de Apoio",
    "Vídeo-aulas",
    "Módulos de Conteúdo",
    "Checklist de Implementação",
    "Publicação"
  ];

  // Função auxiliar para determinar a aba padrão para cada etapa
  function getDefaultTabForStep(step: number): string {
    switch (step) {
      case 0: return "basic";
      case 1: return "tools";
      case 2: return "resources";
      case 3: return "video";
      case 4: return "modules";
      case 5: return "checklist";
      case 6: return "publish";
      default: return "basic";
    }
  }

  // Atualizar a aba ativa quando o passo mudar
  const updateStepAndTab = (newStep: number) => {
    setCurrentStep(newStep);
    setActiveTab(getDefaultTabForStep(newStep));
  };

  return {
    currentStep,
    setCurrentStep: updateStepAndTab,
    activeTab,
    setActiveTab,
    totalSteps,
    stepTitles
  };
};

export default useSolutionSteps;
