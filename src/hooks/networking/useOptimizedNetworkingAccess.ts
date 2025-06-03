
import { useMemo } from 'react';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';
import { useAuth } from '@/contexts/auth';

export const useOptimizedNetworkingAccess = () => {
  const { profile } = useAuth();
  const { isOnboardingComplete, isLoading } = useUnifiedOnboardingValidation();

  const result = useMemo(() => {
    // Admin sempre tem acesso
    const isAdmin = profile?.role === 'admin';
    
    // Para admin, sempre permitir acesso
    if (isAdmin) {
      return {
        hasAccess: true,
        isLoading: false,
        needsOnboarding: false,
        accessMessage: '',
        reason: null
      };
    }

    // Para usuários normais, verificar onboarding
    const hasAccess = isOnboardingComplete;

    return {
      hasAccess,
      isLoading,
      needsOnboarding: !hasAccess,
      accessMessage: !hasAccess ? 'Complete o onboarding para acessar o Networking' : '',
      reason: !hasAccess ? 'Complete o onboarding para acessar o networking' : null
    };
  }, [profile?.role, isOnboardingComplete, isLoading]);

  console.log('🔍 useOptimizedNetworkingAccess:', result);

  return result;
};
