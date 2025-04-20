
import { useStepDefinitions, steps } from './useStepDefinitions';
import { useStepPersistence } from './useStepPersistence';
import { useStepNavigation } from './useStepNavigation';
import { useProgress } from './useProgress';

// Hook principal que orquestra os auxiliares para o onboarding step
export const useOnboardingSteps = () => {
  const { steps, currentStepIndex, setCurrentStepIndex, navigateToStep, navigate } = useStepNavigation();
  const { progress } = useProgress();
  const { saveStepData, completeOnboarding } = useStepPersistence({
    currentStepIndex,
    setCurrentStepIndex,
    navigate,
  });

  const currentStep = steps[currentStepIndex];

  return {
    steps,
    currentStep,
    currentStepIndex,
    isSubmitting: false, // Pode ser melhorado para tratar submissão concorrente — pode ser integrado pelo useStepPersistence se necessário
    saveStepData,
    completeOnboarding,
    progress,
    navigateToStep
  };
};
