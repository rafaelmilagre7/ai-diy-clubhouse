
import { useState, useEffect } from "react";

export const useSolutionSteps = (initialStep: number = 0) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [activeTab, setActiveTab] = useState("basic");
  
  const totalSteps = 6; // Total número de etapas no processo de criação de solução

  // Títulos das etapas
  const stepTitles = [
    "Configuração Básica",
    "Ferramentas Necessárias", 
    "Materiais de Apoio",
    "Vídeo-aulas",
    "Checklist de Implementação",
    "Publicação"
  ];

  // Atualizar activeTab com base no currentStep
  useEffect(() => {
    if (currentStep === 0) {
      setActiveTab("basic");
    } else if (currentStep === 1) {
      setActiveTab("tools");
    } else if (currentStep === 2) {
      setActiveTab("resources");
    } else if (currentStep === 3) {
      setActiveTab("video");
    } else if (currentStep === 4) {
      setActiveTab("checklist");
    } else if (currentStep === 5) {
      setActiveTab("publish");
    }
  }, [currentStep]);

  return {
    currentStep,
    setCurrentStep,
    activeTab,
    setActiveTab,
    totalSteps,
    stepTitles
  };
};
