
import { useOnboardingCompletion } from './useOnboardingCompletion';

export const useSimpleOnboardingValidation = () => {
  const { data: completionData, isLoading } = useOnboardingCompletion();

  const validateOnboardingCompletion = async (): Promise<boolean> => {
    if (isLoading) return false;
    return completionData?.isCompleted || false;
  };

  return {
    validateOnboardingCompletion,
    isOnboardingComplete: completionData?.isCompleted || false,
    hasValidData: completionData?.isCompleted || false
  };
};
