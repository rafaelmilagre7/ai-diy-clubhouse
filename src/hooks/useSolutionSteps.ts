
import { useState } from "react";

export const useSolutionSteps = (initialStep: number = 0) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [activeTab, setActiveTab] = useState('basic');
  
  const stepTitles = [
    "Informações Básicas",
    "Ferramentas",
    "Materiais",
    "Vídeos",
    "Checklist",
    "Publicar"
  ];
  
  const totalSteps = stepTitles.length;
  
  // Map step to tab
  const stepToTab = {
    0: 'basic',
    1: 'tools',
    2: 'resources', 
    3: 'video',
    4: 'checklist',
    5: 'publish'
  };
  
  // Update tab when step changes
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    setActiveTab(stepToTab[step as keyof typeof stepToTab] || 'basic');
  };
  
  return {
    currentStep,
    setCurrentStep: handleStepChange,
    activeTab,
    setActiveTab,
    totalSteps,
    stepTitles
  };
};
