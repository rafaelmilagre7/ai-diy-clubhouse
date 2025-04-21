
import { useState } from "react";
import { useStepNavigation } from "./useStepNavigation";
import { useStepPersistence } from "./useStepPersistence";
import { useProgress } from "./useProgress";

export const useOnboardingSteps = () => {
  const { 
    steps, 
    navigateToStep, 
    currentStepIndex, 
    setCurrentStepIndex,
    navigate,
    allowFreeNavigation,
    setAllowFreeNavigation 
  } = useStepNavigation();
  
  const { saveStepData, completeOnboarding } = useStepPersistence({
    currentStepIndex,
    setCurrentStepIndex,
    navigate
  });
  
  const { progress, refreshProgress, isLoading } = useProgress();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calcular a etapa atual com base no índice
  const currentStep = steps[currentStepIndex];
  
  // Total de etapas do onboarding (excluindo a de revisão e a de geração de trilha)
  const totalSteps = steps.length - 2;
  
  return {
    steps,
    navigateToStep, 
    currentStepIndex,
    totalSteps,
    currentStep,
    progress,
    refreshProgress,
    saveStepData,
    completeOnboarding,
    isSubmitting,
    setIsSubmitting,
    isLoading,
    allowFreeNavigation,
    setAllowFreeNavigation
  };
};
