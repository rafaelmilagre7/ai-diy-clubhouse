
import React from 'react';
import { useParams } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import InviteAcceptPage from '@/components/auth/InviteAcceptPage';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

const RegisterPage = () => {
  const { token: paramToken } = useParams();
  
  // FONTE ÚNICA DE TOKEN
  const inviteToken = paramToken || InviteTokenManager.getToken();

  console.log('[REGISTER-PAGE] Token detectado:', !!inviteToken);

  // Se há um token de convite, mostrar a página específica de convite
  if (inviteToken) {
    return <InviteAcceptPage />;
  }

  // Caso contrário, mostrar o AuthLayout normal
  return <AuthLayout />;
};

export default RegisterPage;
