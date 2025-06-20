
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Invite } from "./types";

export const useInviteResend = () => {
  const [isSending, setIsSending] = useState(false);

  const resendInvite = async (invite: Invite, channels: ('email' | 'whatsapp')[] = ['email']) => {
    try {
      setIsSending(true);

      console.log("🔄 Reenviando convite:", invite.id, "via", channels);

      // Enviar via orquestrador
      const orchestratorResponse = await supabase.functions.invoke('invite-orchestrator', {
        body: {
          inviteId: invite.id,
          email: invite.email,
          whatsappNumber: undefined, // TODO: Adicionar suporte a WhatsApp no reenvio
          roleId: invite.role_id,
          token: invite.token,
          channels,
          isResend: true,
          notes: invite.notes
        }
      });

      if (orchestratorResponse.error) {
        console.error("❌ Erro no orquestrador:", orchestratorResponse.error);
        throw new Error(orchestratorResponse.error.message);
      }

      const orchestratorData = orchestratorResponse.data;
      
      if (orchestratorData?.success) {
        // Atualizar contador de tentativas
        const { error } = await supabase.rpc('update_invite_send_attempt', {
          invite_id: invite.id
        });

        if (error) {
          console.error("❌ Erro ao atualizar tentativas:", error);
        }

        toast.success("Convite reenviado com sucesso!");
      } else {
        throw new Error(orchestratorData?.message || "Erro ao reenviar convite");
      }

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
