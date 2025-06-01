
import { useAuth } from '@/contexts/auth';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';

export function useNetworkingAccess() {
  const { profile } = useAuth();
  const { isOnboardingComplete, isLoading } = useUnifiedOnboardingValidation();
  
  // Verificar se é admin (que tem acesso total)
  const isAdmin = profile?.role === 'admin';
  
  // Verificar se o onboarding está completo
  const hasAccess = isAdmin || isOnboardingComplete;
  
  console.log('🔍 useNetworkingAccess (auth):', {
    isAdmin,
    isOnboardingComplete,
    hasAccess,
    userRole: profile?.role,
    isLoading
  });
  
  const accessMessage = !hasAccess 
    ? 'Complete o onboarding para acessar o Networking Inteligente'
    : '';

  return {
    hasAccess,
    accessMessage,
    isAdmin,
    hasNetworkingPermission: hasAccess,
    isLoading
  };
}
