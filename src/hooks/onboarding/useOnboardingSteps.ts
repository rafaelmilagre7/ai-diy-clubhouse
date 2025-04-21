
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "./useProgress";
import { useStepPersistenceCore } from "./useStepPersistenceCore";
import { steps } from "./useStepDefinitions";

export const useOnboardingSteps = () => {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, refreshProgress } = useProgress();
  
  const { saveStepData, completeOnboarding } = useStepPersistenceCore({
    currentStepIndex,
    setCurrentStepIndex,
    navigate,
  });
  
  // Função que identifica o índice do passo atual
  const findStepIndex = (stepId: string) => {
    return steps.findIndex((step) => step.id === stepId);
  };
  
  // Define a etapa atual com base no currentStepIndex
  const currentStep = steps[currentStepIndex] || steps[0];
  
  // Função para navegar para um passo específico, aceitando tanto índice quanto ID
  const navigateToStep = (stepIndexOrId: number | string) => {
    let stepIndex: number;
    
    if (typeof stepIndexOrId === 'string') {
      // Se for uma string, consideramos como ID da etapa
      stepIndex = findStepIndex(stepIndexOrId);
    } else {
      // Se for número, usamos diretamente como índice
      // Verificamos se o índice está baseado em 1 (como na UI) e ajustamos
      stepIndex = stepIndexOrId > steps.length ? stepIndexOrId - 1 : stepIndexOrId;
    }
    
    if (stepIndex !== -1 && stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStepIndex(stepIndex);
      console.log(`Navegando para etapa: ${steps[stepIndex].path}`);
      navigate(steps[stepIndex].path);
    } else {
      console.warn(`Índice inválido para navegação: ${stepIndexOrId}, convertido para ${stepIndex}`);
    }
  };
  
  return {
    steps,
    currentStepIndex,
    setCurrentStepIndex,
    currentStep,
    progress,
    saveStepData,
    completeOnboarding,
    navigateToStep,
    findStepIndex,
    isSubmitting,
    setIsSubmitting,
    refreshProgress
  };
};
