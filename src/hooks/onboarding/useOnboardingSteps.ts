
import { steps } from './useStepDefinitions';
import { useStepPersistence } from './useStepPersistence';
import { useStepNavigation } from './useStepNavigation';
import { useProgress } from './useProgress';

// Hook principal que orquestra os auxiliares para o onboarding step
export const useOnboardingSteps = () => {
  const { steps: stepList, currentStepIndex, setCurrentStepIndex, navigateToStep, navigate } = useStepNavigation();
  const { progress } = useProgress();
  const { saveStepData, completeOnboarding } = useStepPersistence({
    currentStepIndex,
    setCurrentStepIndex,
    navigate,
  });

  const currentStep = stepList[currentStepIndex];

  return {
    steps: stepList,
    currentStep,
    currentStepIndex,
    isSubmitting: false, // Pode ser melhorado para tratar submissão concorrente — pode ser integrado pelo useStepPersistence se necessário
    saveStepData,
    completeOnboarding,
    progress,
    navigateToStep
  };
};

