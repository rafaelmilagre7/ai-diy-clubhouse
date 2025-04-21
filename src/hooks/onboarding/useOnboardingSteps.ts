
import { useState, useEffect } from 'react';
import { steps } from './useStepDefinitions';
import { useStepPersistence } from './useStepPersistence';
import { useStepNavigation } from './useStepNavigation';
import { useProgress } from './useProgress';
import { useNavigate } from 'react-router-dom';

// Hook principal que orquestra os auxiliares para o onboarding step
export const useOnboardingSteps = () => {
  const { currentStepIndex, setCurrentStepIndex, navigateToStep, navigate } = useStepNavigation();
  const { progress, refreshProgress } = useProgress();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveStepData: persistenceStepData, completeOnboarding } = useStepPersistence({
    currentStepIndex,
    setCurrentStepIndex,
    navigate,
  });
  
  // Efeito para atualizar dados do progresso ao montar o componente
  useEffect(() => {
    console.log("useOnboardingSteps - carregando dados mais recentes");
    refreshProgress();
  }, [refreshProgress]);
  
  // Função wrapper para controlar estado de submissão
  const saveStepData = async (stepId: string, data: any, shouldNavigate: boolean = true) => {
    setIsSubmitting(true);
    try {
      await persistenceStepData(stepId, data, shouldNavigate);
    } catch (error) {
      console.error("Erro ao salvar dados da etapa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const currentStep = steps[currentStepIndex];

  return {
    steps,
    currentStep,
    currentStepIndex, 
    isSubmitting,
    saveStepData,
    completeOnboarding,
    progress,
    navigateToStep,
    refreshProgress
  };
};
