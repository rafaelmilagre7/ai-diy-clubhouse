
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "./useProgress";
import { useStepPersistenceCore } from "./persistence/useStepPersistenceCore";
import { steps } from "./useStepDefinitions";

export const useOnboardingSteps = () => {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { progress } = useProgress();
  
  const { saveStepData, completeOnboarding } = useStepPersistenceCore({
    currentStepIndex,
    setCurrentStepIndex,
    navigate,
  });
  
  // Função que identifica o índice do passo atual
  const findStepIndex = (stepId: string) => {
    return steps.findIndex((step) => step.id === stepId);
  };
  
  // Função para navegar para um passo específico
  const navigateToStep = (stepId: string) => {
    const stepIndex = findStepIndex(stepId);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
      navigate(steps[stepIndex].path);
    }
  };
  
  return {
    steps,
    currentStepIndex,
    setCurrentStepIndex,
    progress,
    saveStepData,
    completeOnboarding,
    navigateToStep,
    findStepIndex,
  };
};
