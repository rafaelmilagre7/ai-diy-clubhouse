
import React from 'react';
import { useParams } from 'react-router-dom';
import { EnhancedInviteRegistration } from '@/components/auth/EnhancedInviteRegistration';

export const InvitePage = () => {
  const { token } = useParams<{ token: string }>();

  console.log('[INVITE-PAGE] Token capturado da URL:', token ? `${token.substring(0, 8)}...` : 'não encontrado');

  // Força um refresh para evitar problemas de cache
  React.useEffect(() => {
    if (!token) {
      console.warn('[INVITE-PAGE] Token não encontrado na URL');
    }
  }, [token]);

  return <EnhancedInviteRegistration token={token} />;
};

export default InvitePage;
