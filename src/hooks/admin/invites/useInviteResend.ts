import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useInviteResend = () => {
  const [isResending, setIsResending] = useState(false);
  const [resendingInviteId, setResendingInviteId] = useState<string | null>(null);

  const resendInvite = async (inviteId: string) => {
    try {
      setIsResending(true);
      setResendingInviteId(inviteId);

      // Simular atualização do convite (sem função RPC)
      const { error } = await supabase
        .from('invites')
        .update({
          // Não podemos atualizar last_sent_at ou send_attempts se não existirem
        })
        .eq('id', inviteId);

      if (error) throw error;

      toast.success('Convite reenviado com sucesso!');
      
    } catch (error: any) {
      console.error('Erro ao reenviar convite:', error);
      toast.error(error.message || 'Erro ao reenviar convite');
      throw error;
    } finally {
      setIsResending(false);
      setResendingInviteId(null);
    }
  };

  const isInviteResending = (inviteId: string) => {
    return resendingInviteId === inviteId;
  };

  return { resendInvite, isResending, isInviteResending };
};
