
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import InviteAcceptPage from '@/components/auth/InviteAcceptPage';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');

  // Se há um token de convite, mostrar a página específica de convite
  if (inviteToken) {
    return <InviteAcceptPage />;
  }

  // Caso contrário, mostrar o AuthLayout normal
  return <AuthLayout />;
};

export default RegisterPage;
