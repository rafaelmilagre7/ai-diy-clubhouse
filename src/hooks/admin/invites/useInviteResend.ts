
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Invite } from "./types";

export const useInviteResend = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const resendInvite = async (invite: Invite) => {
    try {
      setIsSending(true);

      // Atualizar tentativas de envio
      const { error: updateError } = await supabase.rpc('update_invite_send_attempt', {
        invite_id: invite.id
      });

      if (updateError) {
        console.warn('Erro ao atualizar tentativas:', updateError);
      }

      toast({
        title: "Convite reenviado",
        description: `O convite foi reenviado para ${invite.email}.`,
      });
    } catch (error: any) {
      console.error('Erro ao reenviar convite:', error);
      toast({
        title: "Erro ao reenviar convite",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return { resendInvite, isSending };
};
