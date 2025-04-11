
import { useState, useEffect } from "react";

export const useSolutionSteps = (initialStep: number = 0) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [activeTab, setActiveTab] = useState("basic");
  
  const totalSteps = 10; // Total number of steps in the solution creation process

  // Títulos das etapas
  const stepTitles = [
    "Configuração Básica",
    "Landing da Solução", 
    "Visão Geral e Case",
    "Preparação Express",
    "Implementação Passo a Passo",
    "Verificação de Implementação",
    "Primeiros Resultados",
    "Otimização Rápida", 
    "Celebração e Próximos Passos",
    "Revisão e Publicação"
  ];

  // Update activeTab based on currentStep
  useEffect(() => {
    if (currentStep === 0) {
      setActiveTab("basic");
    } else if (currentStep >= 1 && currentStep <= 8) {
      setActiveTab("modules");
    } else if (currentStep === 9) {
      setActiveTab("resources");
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
