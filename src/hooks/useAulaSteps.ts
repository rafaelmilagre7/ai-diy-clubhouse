
import { useState } from "react";

export const useAulaSteps = (initialStep: number = 0) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [activeTab, setActiveTab] = useState(getDefaultTabForStep(initialStep));

  const totalSteps = 5; // Número total de etapas no fluxo
  
  const stepTitles = [
    "Informações Básicas",
    "Imagem e Mídia",
    "Vídeos da Aula",
    "Materiais de Apoio",
    "Publicação"
  ];

  // Função auxiliar para determinar a aba padrão para cada etapa
  function getDefaultTabForStep(step: number): string {
    switch (step) {
      case 0: return "basic";
      case 1: return "media";
      case 2: return "videos";
      case 3: return "materials";
      case 4: return "publish";
      default: return "basic";
    }
  }

  // Avançar para a próxima etapa
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setActiveTab(getDefaultTabForStep(newStep));
    }
  };

  // Voltar para a etapa anterior
  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      setActiveTab(getDefaultTabForStep(newStep));
    }
  };

  // Ir para uma etapa específica
  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
      setActiveTab(getDefaultTabForStep(step));
    }
  };

  return {
    currentStep,
    activeTab,
    setActiveTab,
    nextStep,
    prevStep,
    goToStep,
    totalSteps,
    stepTitles
  };
};

export default useAulaSteps;
