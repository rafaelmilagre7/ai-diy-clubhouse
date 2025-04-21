
import { useStepNavigation } from "./useStepNavigation";

export const useOnboardingSteps = () => {
  const { steps, navigateToStep, currentStepIndex } = useStepNavigation();

  // Total de etapas do onboarding (excluindo a de revisão e a de geração de trilha)
  const totalSteps = steps.length - 2;
  
  return {
    steps,
    navigateToStep, 
    currentStepIndex,
    totalSteps
  };
};
