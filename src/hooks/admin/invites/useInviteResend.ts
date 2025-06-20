
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Invite } from './types';

export function useInviteResend() {
  const [isSending, setIsSending] = useState(false);

  const resendInvite = async (invite: Invite): Promise<void> => {
    setIsSending(true);
    try {
      console.log('🔄 [RESEND-INVITE] Reenviando convite:', invite.email);

      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: {
          email: invite.email,
          token: invite.token,
          roleId: invite.role_id,
          isResend: true
        }
      });

      if (error) {
        console.error('❌ [RESEND-INVITE] Erro:', error);
        toast.error(`Erro ao reenviar convite: ${error.message}`);
        return;
      }

      console.log('✅ [RESEND-INVITE] Sucesso:', data);
      toast.success('Convite reenviado com sucesso!');

    } catch (error: any) {
      console.error('❌ [RESEND-INVITE] Erro geral:', error);
      toast.error(`Erro ao reenviar convite: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return {
    resendInvite,
    isSending
  };
}
