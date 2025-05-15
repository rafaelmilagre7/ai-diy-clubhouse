
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
    navigateToStepById,
    isProgressLoaded 
  } = useStepNavigation();
  
  const { progress, isLoading, refreshProgress } = useProgress();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { saveStepData: coreSaveStepData, completeOnboarding } = useStepPersistenceCore({
    currentStepIndex,
    setCurrentStepIndex: (idx: number) => baseNavigateToStep(idx),
    navigate,
  });
  
  // Wrapper para o saveStepData que inclui o estado de submissão
  const saveStepData = async (stepIdOrData: string | any, dataOrShouldNavigate?: any | boolean, thirdParam?: boolean) => {
    setIsSubmitting(true);
    try {
      await coreSaveStepData(stepIdOrData, dataOrShouldNavigate, thirdParam);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Verificar se as condições necessárias para renderização estão satisfeitas
  const isReadyToRender = isProgressLoaded();

  return {
    currentStepIndex,
    currentStep: steps[currentStepIndex],
    steps,
    isSubmitting,
    saveStepData,
    progress,
    isLoading,
    isReadyToRender,
    refreshProgress,
    navigateToStep,
    completeOnboarding
  };
};
