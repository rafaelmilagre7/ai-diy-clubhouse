
import { useMemo } from 'react';
import { useOptimizedAuth } from '@/hooks/auth/useOptimizedAuth';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';

/**
 * Hook otimizado para acesso ao networking
 * Remove lógica desnecessária e memoiza resultados
 */
export const useOptimizedNetworkingAccess = () => {
  const { isAdmin, isLoading: authLoading } = useOptimizedAuth();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useUnifiedOnboardingValidation();

  return useMemo(() => {
    const isLoading = authLoading || onboardingLoading;
    const hasAccess = isAdmin || isOnboardingComplete;

    return {
      hasAccess,
      isLoading,
      isAdmin,
      needsOnboarding: !hasAccess && !isAdmin,
      accessMessage: !hasAccess ? 'Complete o onboarding para acessar o Networking' : null
    };
  }, [isAdmin, isOnboardingComplete, authLoading, onboardingLoading]);
};
