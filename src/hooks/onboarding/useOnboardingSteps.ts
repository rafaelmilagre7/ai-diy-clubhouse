
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "./useProgress";
import { useStepPersistenceCore } from "./useStepPersistenceCore";
import { steps } from "./useStepDefinitions";

export const useOnboardingSteps = () => {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { progress, isLoading, refreshProgress } = useProgress();
  const { saveStepData, completeOnboarding } = useStepPersistenceCore({
    currentStepIndex,
    setCurrentStepIndex,
    navigate,
  });

  // Determinar o índice atual baseado nas etapas completadas
  useEffect(() => {
    if (progress?.completed_steps) {
      const lastCompletedStep = progress.completed_steps[progress.completed_steps.length - 1];
      const nextStepIndex = steps.findIndex(step => step.id === lastCompletedStep) + 1;
      if (nextStepIndex < steps.length) {
        setCurrentStepIndex(nextStepIndex);
      }
    }
  }, [progress?.completed_steps]);

  const navigateToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
      navigate(steps[index].path);
    }
  };

  return {
    currentStepIndex,
    currentStep: steps[currentStepIndex],
    steps,
    isSubmitting: false,
    saveStepData,
    progress,
    isLoading,
    refreshProgress,
    navigateToStep,
    completeOnboarding // Adicionando a função aqui
  };
};
