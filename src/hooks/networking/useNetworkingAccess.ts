
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';
import { useAuth } from '@/contexts/auth';

export const useNetworkingAccess = () => {
  const { profile } = useAuth();
  const { isOnboardingComplete } = useUnifiedOnboardingValidation();

  // Verificar se é admin (sempre tem acesso)
  const isAdmin = profile?.role === 'admin';
  
  // Verificar se o onboarding está completo
  const hasAccess = isAdmin || isOnboardingComplete;

  console.log('🔍 useNetworkingAccess:', {
    isAdmin,
    isOnboardingComplete,
    hasAccess,
    userRole: profile?.role
  });

  return {
    hasAccess,
    isAdmin,
    isOnboardingComplete,
    reason: !hasAccess ? 'Onboarding não concluído' : null
  };
};
