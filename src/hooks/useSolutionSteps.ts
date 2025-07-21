
import { useState } from "react";

export const useSolutionSteps = (initialStep: number = 0) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [activeTab, setActiveTab] = useState(getDefaultTabForStep(initialStep));

  const totalSteps = 6; // Corrigido: 6 etapas (0-5) em vez de 7
  
  const stepTitles = [
    "Informações Básicas",
    "Ferramentas Necessárias", 
    "Materiais de Apoio",
    "Vídeo-aulas",
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
      case 4: return "checklist";
      case 5: return "publish";
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
