
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
  const { user, profile } = useAuth();

  const redirect = useCallback((options: RedirectOptions = {}) => {
    const {
      requiresOnboarding = false,
      fromInvite = false,
      preserveToken = false
    } = options;

    console.log('[INTELLIGENT-REDIRECT] Processando redirecionamento:', {
      userId: user?.id,
      requiresOnboarding,
      fromInvite,
      preserveToken,
      hasStoredToken: InviteTokenManager.hasStoredToken()
    });

    // Se precisa preservar token, armazenar antes do redirecionamento
    if (preserveToken && fromInvite) {
      const currentToken = new URLSearchParams(window.location.search).get('token');
      if (currentToken) {
        InviteTokenManager.storeToken(currentToken);
        console.log('[INTELLIGENT-REDIRECT] Token preservado para uso posterior');
      }
    }

    // Determinar destino baseado no estado
    if (requiresOnboarding) {
      const storedToken = InviteTokenManager.getStoredToken();
      
      if (storedToken) {
        console.log('[INTELLIGENT-REDIRECT] Redirecionando para onboarding com token preservado');
        navigate(`/onboarding?token=${storedToken}`);
        // NÃO limpar o token aqui - deixar o onboarding gerenciar
      } else {
        console.log('[INTELLIGENT-REDIRECT] Redirecionando para onboarding sem token');
        navigate('/onboarding');
      }
    } else {
      console.log('[INTELLIGENT-REDIRECT] Redirecionando para dashboard');
      // Só limpar o token se não precisar mais dele
      if (!requiresOnboarding) {
        InviteTokenManager.clearToken();
      }
      navigate('/dashboard');
    }
  }, [navigate, user]);

  return { redirect };
};
