
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Invite } from "./types";

export const useInviteResend = () => {
  const [isSending, setIsSending] = useState(false);

  const resendInvite = async (invite: Invite) => {
    try {
      setIsSending(true);

      // Atualizar contador de tentativas
      const { error } = await supabase.rpc('update_invite_send_attempt', {
        invite_id: invite.id
      });

      if (error) throw error;

      toast.success("Convite reenviado com sucesso!");
    } catch (error: any) {
      console.error('Erro ao reenviar convite:', error);
      toast.error(error.message || "Erro ao reenviar convite");
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return { resendInvite, isSending };
};
