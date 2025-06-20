
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Invite } from "./types";

export const useInviteResend = () => {
  const [isSending, setIsSending] = useState(false);

  const resendInvite = async (
    invite: Invite, 
    channels: ('email' | 'whatsapp')[] = ['email'],
    whatsappNumber?: string
  ) => {
    try {
      setIsSending(true);

      console.log("🔄 Reenviando convite:", invite.id, "via", channels);

      // Determinar número do WhatsApp
      const whatsappNumberToUse = whatsappNumber || invite.whatsapp_number;

      // Validar se WhatsApp está selecionado mas não tem número
      if (channels.includes('whatsapp') && !whatsappNumberToUse) {
        toast.error("Número do WhatsApp é obrigatório para reenvio via WhatsApp");
        return;
      }

      // Enviar via orquestrador
      const orchestratorResponse = await supabase.functions.invoke('invite-orchestrator', {
        body: {
          inviteId: invite.id,
          email: invite.email,
          whatsappNumber: whatsappNumberToUse,
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

        const channelNames = channels.map(c => c === 'email' ? 'E-mail' : 'WhatsApp').join(' e ');
        toast.success(`Convite reenviado com sucesso via ${channelNames}!`);
        
        // Log da atividade de reenvio
        console.log("✅ Reenvio concluído:", {
          inviteId: invite.id,
          channels,
          successfulChannels: orchestratorData.summary?.successfulChannels || 0,
          totalChannels: orchestratorData.summary?.totalChannels || 0
        });
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
