
import { useOnboardingCompletion } from '@/hooks/onboarding/useOnboardingCompletion';
import { useAuth } from '@/contexts/auth';

export const useNetworkingAccessGuard = () => {
  const { profile } = useAuth();
  const { data: onboardingData, isLoading } = useOnboardingCompletion();

  // Verificar se é admin (sempre tem acesso)
  const isAdmin = profile?.role === 'admin';
  
  // Verificar se o onboarding está completo
  const isOnboardingComplete = onboardingData?.isCompleted || false;
  
  // Determinar se tem acesso
  const hasAccess = isAdmin || isOnboardingComplete;

  console.log('🔍 useNetworkingAccessGuard:', {
    isAdmin,
    isOnboardingComplete,
    hasAccess,
    userRole: profile?.role,
    isLoading
  });

  return {
    hasAccess,
    isAdmin,
    isOnboardingComplete,
    isLoading,
    needsOnboarding: !hasAccess && !isAdmin
  };
};
