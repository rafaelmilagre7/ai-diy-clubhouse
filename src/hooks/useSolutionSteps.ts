
import { useState, useEffect } from "react";

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

  // Effect to update the active tab when the step changes
  useEffect(() => {
    if (currentStep >= 0 && currentStep < stepToTabMap.length) {
      setActiveTab(stepToTabMap[currentStep]);
    }
  }, [currentStep]);

  // Function to update the step when the tab changes
  const updateStepFromActiveTab = (tab: string) => {
    const stepIndex = stepToTabMap.findIndex(t => t === tab);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  };

  // Effect to update the step when the active tab changes
  useEffect(() => {
    updateStepFromActiveTab(activeTab);
  }, [activeTab]);

  return {
    currentStep,
    setCurrentStep,
    activeTab,
    setActiveTab,
    totalSteps: stepTitles.length,
    stepTitles
  };
};
