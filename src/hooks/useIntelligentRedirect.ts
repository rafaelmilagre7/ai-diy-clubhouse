
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

interface RedirectOptions {
  requiresOnboarding?: boolean;
  fromInvite?: boolean;
  preserveToken?: boolean;
}

export const useIntelligentRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const redirect = useCallback((options: RedirectOptions = {}) => {
    const {
      requiresOnboarding = false,
      fromInvite = false,
      preserveToken = false
    } = options;

    console.log('[INTELLIGENT-REDIRECT] Redirecionando:', {
      userId: user?.id,
      requiresOnboarding,
      fromInvite,
      preserveToken
    });

    // Preservar token se necessário
    if (preserveToken && fromInvite) {
      const currentToken = new URLSearchParams(window.location.search).get('token');
      if (currentToken) {
        InviteTokenManager.storeToken(currentToken);
      }
    }

    // Redirecionamento direto e simples
    if (requiresOnboarding) {
      const storedToken = InviteTokenManager.getToken();
      const destination = storedToken ? `/onboarding?token=${storedToken}` : '/onboarding';
      navigate(destination);
    } else {
      // Limpar token se não precisar mais
      InviteTokenManager.clearToken();
      navigate('/dashboard');
    }
  }, [navigate, user]);

  return { redirect };
};
