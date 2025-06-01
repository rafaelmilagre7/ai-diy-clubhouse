
import { useOnboardingCompletion } from '@/hooks/onboarding/useOnboardingCompletion';
import { useAuth } from '@/contexts/auth';

export const useNetworkingAccessGuard = () => {
  const { profile } = useAuth();
  const { data: onboardingData, isLoading } = useOnboardingCompletion();

  // Verificar se o onboarding está completo (SEM exceção para admin)
  const isOnboardingComplete = onboardingData?.isCompleted || false;
  
  // Determinar se tem acesso (TODOS precisam completar onboarding)
  const hasAccess = isOnboardingComplete;

  console.log('🔍 useNetworkingAccessGuard:', {
    isOnboardingComplete,
    hasAccess,
    userRole: profile?.role,
    isLoading
  });

  return {
    hasAccess,
    isAdmin: profile?.role === 'admin',
    isOnboardingComplete,
    isLoading,
    needsOnboarding: !hasAccess
  };
};
