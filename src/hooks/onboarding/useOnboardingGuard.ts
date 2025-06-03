
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from './useProgress';
import { useOnboardingValidation } from './useOnboardingValidation';

export const useOnboardingGuard = (redirectToCompleted: boolean = true) => {
  const { progress, isLoading } = useProgress();
  const { validateOnboardingCompletion } = useOnboardingValidation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (progress) {
      const isComplete = validateOnboardingCompletion(progress);
      
      if (isComplete && redirectToCompleted) {
        console.log("[OnboardingGuard] Onboarding completo, redirecionando para página de sucesso");
        navigate('/onboarding/completed', { replace: true });
      }
    }
  }, [progress, isLoading, validateOnboardingCompletion, navigate, redirectToCompleted]);

  return {
    isOnboardingComplete: progress ? validateOnboardingCompletion(progress) : false,
    isLoading,
    progress
  };
};
