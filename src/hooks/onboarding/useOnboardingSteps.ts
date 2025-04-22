
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { steps } from "./useStepDefinitions";
import { useStepPersistenceCore } from "./persistence/useStepPersistenceCore";
import { useProgress } from "./useProgress";

/**
 * Hook principal para controle do fluxo de onboarding
 * Gerencia o estado atual, navegação e persistência de dados
 */
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
    // Se o primeiro argumento é uma string, estamos usando a assinatura com stepId explícito
    if (typeof stepIdOrData === 'string') {
      return coreSaveStepData(stepIdOrData, dataOrShouldNavigate, shouldNavigate);
    } 
    // Caso contrário, usando a assinatura simplificada (apenas com data)
    else {
      return coreSaveStepData(stepIdOrData, dataOrShouldNavigate);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  // Função para navegar para uma etapa específica por índice
  const navigateToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
      navigate(steps[index].path);
    }
  }, [navigate]);

  // Função para navegar para uma etapa específica por ID
  const navigateToStepById = useCallback((stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
      navigate(steps[stepIndex].path);
    }
  }, [navigate]);

  // Sincroniza o índice da etapa atual com a rota atual
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
    navigateToStepById,
    isSubmitting,
    setIsSubmitting,
    saveStepData,
    isLastStep,
    completeOnboarding,
    progress,
    isLoading
  };
};
