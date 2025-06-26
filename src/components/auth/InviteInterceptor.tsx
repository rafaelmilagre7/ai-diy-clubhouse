
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import LoadingScreen from '@/components/common/LoadingScreen';
import InviteErrorScreen from './InviteErrorScreen';
import InviteEmailMismatchScreen from './InviteEmailMismatchScreen';
import AuthManager from '@/services/AuthManager';
import { logger } from '@/utils/logger';

const InviteInterceptor = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useSimpleAuth();
  const { inviteDetails, isLoading: inviteLoading, error: inviteError } = useInviteFlow(token);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    logger.info('[INVITE-INTERCEPTOR] 🎯 Iniciando interceptação', {
      hasToken: !!token,
      hasUser: !!user,
      userEmail: user?.email,
      authLoading,
      inviteLoading,
      hasInviteDetails: !!inviteDetails,
      hasError: !!inviteError
    });
  }, [token, user, authLoading, inviteLoading, inviteDetails, inviteError]);

  useEffect(() => {
    // Aguardar carregamentos completos antes de processar
    if (authLoading || inviteLoading || isProcessing) return;
    
    // Se há erro no convite, não processar
    if (inviteError || !inviteDetails || !token) return;

    const processInviteFlow = async () => {
      setIsProcessing(true);
      
      try {
        const authManager = AuthManager.getInstance();
        const redirectPath = await authManager.handleInviteFlow({
          token,
          inviteEmail: inviteDetails.email,
          currentUser: user,
          inviteDetails
        });

        if (redirectPath) {
          logger.info('[INVITE-INTERCEPTOR] 🚀 Redirecionando para', { redirectPath });
          navigate(redirectPath, { replace: true });
        }
      } catch (error) {
        logger.error('[INVITE-INTERCEPTOR] ❌ Erro no processamento', error);
      } finally {
        setIsProcessing(false);
      }
    };

    processInviteFlow();
  }, [authLoading, inviteLoading, inviteError, inviteDetails, token, user, navigate, isProcessing]);

  // Loading states
  if (authLoading || inviteLoading || isProcessing) {
    return <LoadingScreen message="Processando convite..." />;
  }

  // Token inválido ou não encontrado
  if (!token) {
    logger.error('[INVITE-INTERCEPTOR] ❌ Token não encontrado na URL');
    return (
      <InviteErrorScreen 
        error="Link de convite inválido"
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Erro no convite
  if (inviteError || !inviteDetails) {
    logger.error('[INVITE-INTERCEPTOR] ❌ Erro nos detalhes do convite', { error: inviteError });
    return (
      <InviteErrorScreen 
        error={inviteError || 'Convite não encontrado ou expirado'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Usuário autenticado com e-mail diferente
  if (user && user.email !== inviteDetails.email) {
    logger.warn('[INVITE-INTERCEPTOR] ⚠️ E-mail incorreto', {
      userEmail: user.email,
      inviteEmail: inviteDetails.email
    });
    
    return (
      <InviteEmailMismatchScreen
        inviteEmail={inviteDetails.email}
        currentEmail={user.email}
        token={token}
      />
    );
  }

  // Fallback - este ponto não deveria ser alcançado normalmente
  logger.warn('[INVITE-INTERCEPTOR] ⚠️ Estado inesperado - redirecionando para login');
  return <LoadingScreen message="Redirecionando..." />;
};

export default InviteInterceptor;
