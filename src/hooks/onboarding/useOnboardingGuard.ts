
import { useSimpleOnboardingValidation } from './useSimpleOnboardingValidation';

export const useOnboardingGuard = (redirectToOnboarding: boolean = true) => {
  const { isOnboardingComplete, hasValidData } = useSimpleOnboardingValidation();
  
  return {
    isOnboardingComplete,
    isLoading: !hasValidData,
    shouldRedirect: redirectToOnboarding && !isOnboardingComplete
  };
};
