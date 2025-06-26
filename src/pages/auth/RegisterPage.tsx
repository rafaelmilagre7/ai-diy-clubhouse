
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import InviteAcceptPage from '@/components/auth/InviteAcceptPage';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { logger } from '@/utils/logger';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  
  // Buscar token de diferentes fontes - SIMPLIFICADO
  const tokenFromUrl = searchParams.get('token');
  const tokenFromStorage = InviteTokenManager.getToken();
  const inviteToken = tokenFromUrl || tokenFromStorage;
  
  // Verificar se é fluxo de convite
  const isInviteFlow = searchParams.get('invite') === 'true' || !!inviteToken;

  logger.info('[REGISTER-PAGE] 📝 Renderizando página:', {
    hasTokenFromUrl: !!tokenFromUrl,
    hasTokenFromStorage: !!tokenFromStorage,
    isInviteFlow,
    pathname: window.location.pathname
  });

  // Se é fluxo de convite E tem token, mostrar página específica de convite
  if (isInviteFlow && inviteToken) {
    return <InviteAcceptPage />;
  }

  // Caso contrário, mostrar AuthLayout normal
  return <AuthLayout />;
};

export default RegisterPage;
