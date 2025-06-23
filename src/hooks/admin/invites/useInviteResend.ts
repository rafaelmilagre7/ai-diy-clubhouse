
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

      console.log("🔄 [INVITE-RESEND] Iniciando reenvio:", {
        inviteId: invite.id,
        email: invite.email,
        channels,
        currentAttempts: invite.send_attempts || 0
      });

      // Determinar número do WhatsApp
      const whatsappNumberToUse = whatsappNumber || invite.whatsapp_number;

      // Validar se WhatsApp está selecionado mas não tem número
      if (channels.includes('whatsapp') && !whatsappNumberToUse) {
        throw new Error("Número do WhatsApp é obrigatório para reenvio via WhatsApp");
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
        console.error("❌ [INVITE-RESEND] Erro no orquestrador:", orchestratorResponse.error);
        throw new Error(orchestratorResponse.error.message || "Erro no serviço de envio");
      }

      const orchestratorData = orchestratorResponse.data;
      
      if (orchestratorData?.success) {
        // Atualizar contador de tentativas
        const { error: updateError } = await supabase.rpc('update_invite_send_attempt', {
          invite_id: invite.id
        });

        if (updateError) {
          console.warn("⚠️ [INVITE-RESEND] Erro ao atualizar tentativas:", updateError);
        }

        const channelNames = channels.map(c => c === 'email' ? 'E-mail' : 'WhatsApp').join(' e ');
        
        console.log("✅ [INVITE-RESEND] Reenvio concluído:", {
          inviteId: invite.id,
          channels,
          successfulChannels: orchestratorData.summary?.successfulChannels || channels.length,
          newAttemptCount: (invite.send_attempts || 0) + 1
        });

        return {
          success: true,
          message: `Convite reenviado via ${channelNames}`,
          newAttemptCount: (invite.send_attempts || 0) + 1
        };
      } else {
        throw new Error(orchestratorData?.message || "Falha no reenvio do convite");
      }

    } catch (error: any) {
      console.error('❌ [INVITE-RESEND] Erro crítico:', error);
      
      const errorMessage = error.message || "Erro inesperado ao reenviar convite";
      
      // Log do erro para debug
      console.error('[INVITE-RESEND] Detalhes do erro:', {
        inviteId: invite.id,
        email: invite.email,
        error: error.message,
        stack: error.stack
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return { resendInvite, isSending };
};
