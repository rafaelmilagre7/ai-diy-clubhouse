
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { steps } from "./useStepDefinitions";
import { useStepNavigation } from "./useStepNavigation";
import { useStepPersistenceCore } from "./persistence/useStepPersistenceCore";
import { OnboardingData } from "@/types/onboarding";
import { OnboardingProgress } from "@/types/onboarding";
import { useProgress } from "./useProgress";

export const useOnboardingSteps = () => {
  const { 
    currentStepIndex, 
    setCurrentStepIndex, 
    progress, 
    navigateToStep: navigateToStepBase, 
    navigateToStepById,
    isLoading, 
    currentStep 
  } = useStepNavigation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { updateProgress, refreshProgress } = useProgress();

  const { saveStepData: saveStepDataCore } = useStepPersistenceCore({
    currentStepIndex,
    setCurrentStepIndex,
    navigate
  });

  const saveStepData = async (
    stepIdOrData: string | any,
    dataOrShouldNavigate?: any | boolean,
    shouldNavigate?: boolean
  ): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      await saveStepDataCore(stepIdOrData, dataOrShouldNavigate, shouldNavigate);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToStep = (index: number) => {
    navigateToStepBase(index);
  };

  const navigateToPreviousStep = () => {
    if (currentStepIndex > 0) {
      navigateToStep(currentStepIndex - 1);
    }
  };

  const completeOnboarding = async (): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      if (!progress?.id) {
        throw new Error("ID de progresso não encontrado");
      }
      
      await updateProgress({
        is_completed: true,
        completed_steps: steps.map(step => step.id)
      });
      
      await refreshProgress();
      
      // Navegar para a tela de geração de trilha
      navigate('/onboarding/trail-generation');
    } catch (error) {
      console.error("Erro ao finalizar onboarding:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStepIndex,
    progress: progress as OnboardingProgress,
    isSubmitting,
    isLoading,
    steps,
    currentStep,
    saveStepData,
    navigateToStep,
    navigateToStepById,
    navigateToPreviousStep,
    completeOnboarding
  };
};
