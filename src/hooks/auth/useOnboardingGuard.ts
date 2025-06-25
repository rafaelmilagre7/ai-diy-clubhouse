
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useOnboardingRequired } from '@/hooks/useOnboardingRequired';
import { logger } from '@/utils/logger';

/**
 * Hook centralizado para garantir onboarding obrigatório
 * Use em qualquer componente que precisa garantir que o usuário completou o onboarding
 */
export const useOnboardingGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useSimpleAuth();
  const { isRequired: onboardingRequired, isLoading } = useOnboardingRequired();

  useEffect(() => {
    // Aguardar carregamento
    if (isLoading || !user) return;

    // Se onboarding é obrigatório e não estamos na página de onboarding
    if (onboardingRequired && location.pathname !== '/onboarding') {
      logger.warn('[ONBOARDING-GUARD] Bloqueando acesso - onboarding obrigatório:', {
        pathname: location.pathname,
        userId: user.id.substring(0, 8) + '***',
        userRole: profile?.user_roles?.name,
        onboardingStatus: profile?.onboarding_completed
      });

      navigate('/onboarding', { replace: true });
    }
  }, [onboardingRequired, isLoading, user, location.pathname, navigate, profile]);

  return {
    isBlocked: onboardingRequired && location.pathname !== '/onboarding',
    isLoading,
    onboardingRequired
  };
};
