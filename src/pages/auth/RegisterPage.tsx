
import React from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import InviteAcceptPage from '@/components/auth/InviteAcceptPage';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const { token: paramToken } = useParams();
  
  // CORREÇÃO 3: Obter token de múltiplas fontes
  const inviteToken = paramToken || searchParams.get('token') || InviteTokenManager.getStoredToken();

  console.log('[REGISTER-PAGE] Renderizando com token:', {
    paramToken,
    searchParamToken: searchParams.get('token'),
    storedToken: InviteTokenManager.getStoredToken(),
    finalToken: inviteToken
  });

  // Se há um token de convite, mostrar a página específica de convite
  if (inviteToken) {
    return <InviteAcceptPage />;
  }

  // Caso contrário, mostrar o AuthLayout normal
  return <AuthLayout />;
};

export default RegisterPage;
