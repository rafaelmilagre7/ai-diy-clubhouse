
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingSteps } from "./useOnboardingSteps";

export function useFormNavigation() {
  const navigate = useNavigate();
  const { currentStepIndex, steps, navigateToStep } = useOnboardingSteps();

  const nextStep = useCallback((increment = 1) => {
    const newIndex = currentStepIndex + increment;
    
    if (newIndex >= 0 && newIndex < steps.length) {
      navigateToStep(newIndex);
    } else {
      console.warn(`Tentativa de navegação para índice inválido: ${newIndex}`);
    }
  }, [currentStepIndex, navigateToStep, steps.length]);

  return { nextStep };
}
