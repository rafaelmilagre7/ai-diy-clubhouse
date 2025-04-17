
import { useState } from "react";

export const useSolutionSteps = (initialStep = 0) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [activeTab, setActiveTab] = useState("basic");

  // Define the step titles for each step in the solution editor
  const stepTitles = [
    "Informações Básicas",
    "Ferramentas",
    "Recursos",
    "Vídeos e Lições",
    "Checklist de Implementação",
    "Publicação"
  ];

  // Map step to active tab
  const stepToTabMap = [
    "basic",      // Step 0: Basic Info
    "tools",      // Step 1: Tools
    "resources",  // Step 2: Resources
    "video",      // Step 3: Video
    "checklist",  // Step 4: Checklist
    "publish"     // Step 5: Publish
  ];

  // Update active tab based on current step
  const updateActiveTabFromStep = (step: number) => {
    if (step >= 0 && step < stepToTabMap.length) {
      setActiveTab(stepToTabMap[step]);
    }
  };

  // Effect to update the active tab when the step changes
  if (stepToTabMap[currentStep] !== activeTab) {
    updateActiveTabFromStep(currentStep);
  }

  // Effect to update the step when the tab changes
  const updateStepFromActiveTab = (tab: string) => {
    const stepIndex = stepToTabMap.findIndex(t => t === tab);
    if (stepIndex !== -1 && stepIndex !== currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    activeTab,
    setActiveTab: (tab: string) => {
      setActiveTab(tab);
      updateStepFromActiveTab(tab);
    },
    totalSteps: stepTitles.length,
    stepTitles
  };
};
