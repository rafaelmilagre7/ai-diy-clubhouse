
import { useState } from "react";

export const useSolutionSteps = (initialStep: number = 0) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [activeTab, setActiveTab] = useState("basic");

  // Configurações das etapas
  const totalSteps = 7;
  const stepTitles = [
    "Informações Básicas",
    "Ferramentas Necessárias", 
    "Materiais de Apoio",
    "Vídeo-aulas",
    "Módulos",
    "Checklist de Implementação",
    "Publicação"
  ];

  return {
    currentStep,
    setCurrentStep,
    activeTab,
    setActiveTab,
    totalSteps,
    stepTitles
  };
};
