import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { steps } from "./useStepDefinitions";
import { useStepPersistenceCore } from "./persistence/useStepPersistenceCore";
import { useProgress } from "./useProgress";

export const useOnboardingSteps = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { progress, isLoading } = useProgress();
  
  // Obtém a persistência de etapas
  const { saveStepData: coreSaveStepData, completeOnboarding } = useStepPersistenceCore({
    currentStepIndex,
    setCurrentStepIndex,
    navigate,
  });

  // Wrapper para saveStepData para manter compatibilidade com diferentes assinaturas
  const saveStepData = async (
    stepIdOrData: string | any,
    dataOrShouldNavigate?: any | boolean,
    shouldNavigate?: boolean
  ) => {
    return coreSaveStepData(stepIdOrData, dataOrShouldNavigate, shouldNavigate);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const navigateToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
      navigate(steps[index].path);
    }
  }, [navigate]);

  useEffect(() => {
    const path = location.pathname;
    const stepIndex = steps.findIndex(step => step.path === path);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
    }
  }, [location.pathname]);

  return {
    currentStepIndex,
    setCurrentStepIndex,
    steps,
    currentStep,
    navigateToStep,
    isSubmitting,
    setIsSubmitting,
    saveStepData,
    isLastStep,
    completeOnboarding,
    progress,
  };
};
