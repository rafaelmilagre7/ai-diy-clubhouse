
import React, { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import InviteRegisterForm from './InviteRegisterForm';
import InviteUserExistsScreen from './InviteUserExistsScreen';
import InviteErrorScreen from './InviteErrorScreen';
import LoadingScreen from '@/components/common/LoadingScreen';
import { logger } from '@/utils/logger';

const InviteAcceptPage = () => {
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useSimpleAuth();
  const [showUserExists, setShowUserExists] = useState(false);
  
  const inviteToken = searchParams.get('token');
  const { inviteDetails, isLoading: inviteLoading, error: inviteError } = useInviteFlow(inviteToken);

  useEffect(() => {
    logger.info('[INVITE-ACCEPT-PAGE] 🎯 Inicializando página de aceite:', {
      hasToken: !!inviteToken,
      hasUser: !!user,
      authLoading,
      inviteLoading,
      hasInviteDetails: !!inviteDetails,
      hasInviteError: !!inviteError
    });
  }, [inviteToken, user, authLoading, inviteLoading, inviteDetails, inviteError]);

  // Se não há token, redirecionar para login
  if (!inviteToken) {
    logger.warn('[INVITE-ACCEPT-PAGE] ❌ Sem token - redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // Se usuário já está logado, armazenar token e redirecionar para onboarding
  if (user && !authLoading) {
    logger.info('[INVITE-ACCEPT-PAGE] ✅ Usuário logado - redirecionando para onboarding');
    InviteTokenManager.storeToken(inviteToken);
    return <Navigate to="/onboarding" replace />;
  }

  // Loading states
  if (authLoading || inviteLoading) {
    return <LoadingScreen message="Verificando convite..." />;
  }

  // Erro no convite
  if (inviteError || !inviteDetails) {
    logger.error('[INVITE-ACCEPT-PAGE] ❌ Erro no convite:', inviteError);
    return (
      <InviteErrorScreen 
        error={inviteError || 'Convite não encontrado ou inválido'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Mostrar tela de usuário já existe
  if (showUserExists) {
    return <InviteUserExistsScreen email={inviteDetails.email} />;
  }

  // Mostrar formulário de criação de conta
  logger.info('[INVITE-ACCEPT-PAGE] 🎨 Renderizando formulário de registro:', {
    email: inviteDetails.email,
    hasName: !!inviteDetails.name,
    roleName: inviteDetails.role.name
  });

  return (
    <InviteRegisterForm
      email={inviteDetails.email}
      initialName={inviteDetails.name}
      token={inviteToken}
      onUserExists={() => setShowUserExists(true)}
    />
  );
};

export default InviteAcceptPage;
