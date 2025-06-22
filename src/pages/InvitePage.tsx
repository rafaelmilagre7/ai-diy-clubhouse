
import React from 'react';
import { useParams } from 'react-router-dom';
import { EnhancedInviteRegistration } from '@/components/auth/EnhancedInviteRegistration';

export const InvitePage = () => {
  const { token } = useParams<{ token: string }>();

  console.log('[INVITE-PAGE] Token capturado da URL:', token);

  return <EnhancedInviteRegistration token={token} />;
};

export default InvitePage;
