
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "./useProgress";
import { useStepPersistenceCore } from "./useStepPersistenceCore";
import { steps } from "./useStepDefinitions";
import { useStepNavigation } from "./useStepNavigation";

export const useOnboardingSteps = () => {
  const navigate = useNavigate();
  const { 
    currentStepIndex, 
    navigateToStep: baseNavigateToStep,
    navigateToStepById 
  } = useStepNavigation();
  const { progress, isLoading, refreshProgress } = useProgress();
  const { saveStepData, completeOnboarding } = useStepPersistenceCore({
    currentStepIndex,
    setCurrentStepIndex: (idx: number) => { /* Esta função será substituída */ },
    navigate,
  });

  // Função melhorada para navegação - pode receber ID ou índice
  const navigateToStep = (indexOrId: number | string) => {
    console.log(`[useOnboardingSteps] Navegando para: ${indexOrId}, tipo: ${typeof indexOrId}`);
    
    if (typeof indexOrId === 'string') {
      // Se for string, assumimos que é um ID
      navigateToStepById(indexOrId);
    } else if (typeof indexOrId === 'number') {
      // Se for número, usamos a navegação baseada em índice
      if (indexOrId >= 0 && indexOrId < steps.length) {
        baseNavigateToStep(indexOrId);
      } else {
        console.error(`[useOnboardingSteps] Índice inválido: ${indexOrId}`);
      }
    } else {
      console.error(`[useOnboardingSteps] Tipo inválido para navegação:`, indexOrId);
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
    completeOnboarding
  };
};
