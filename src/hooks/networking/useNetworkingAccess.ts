
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';
import { useAuth } from '@/contexts/auth';
import { useMemo } from 'react';

export const useNetworkingAccess = () => {
  const { profile } = useAuth();
  const { isOnboardingComplete, isLoading } = useUnifiedOnboardingValidation();

  const result = useMemo(() => {
    // Verificar se é admin (sempre tem acesso)
    const isAdmin = profile?.role === 'admin';
    
    // Verificar se o onboarding está completo
    const hasAccess = isAdmin || isOnboardingComplete;

    const accessMessage = !hasAccess 
      ? 'Complete o onboarding para acessar o Networking Inteligente'
      : '';

    return {
      hasAccess,
      accessMessage,
      isAdmin,
      hasNetworkingPermission: hasAccess,
      isOnboardingComplete,
      isLoading,
      needsOnboarding: !hasAccess,
      reason: !hasAccess ? 'Complete o onboarding para acessar o networking' : null
    };
  }, [profile?.role, isOnboardingComplete, isLoading]);

  return result;
};
