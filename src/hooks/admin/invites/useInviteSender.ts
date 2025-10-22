import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface InviteSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  sentAt?: string;
  recipient?: string;
}

export const useInviteSender = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendInviteEmail = async (inviteData: {
    inviteId: string;
    email: string;
    token: string;
    roleName: string;
    invitedByName: string;
    expiresAt: string;
    notes?: string;
  }): Promise<InviteSendResult> => {
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: inviteData
      });

      if (error) {
        console.error('❌ [HOOK] Erro no envio de email:', error);
        toast({
          title: "Erro no envio",
          description: "Não foi possível enviar o convite por email.",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      toast({
        title: "Email enviado!",
        description: `Convite enviado para ${inviteData.email}`,
      });
      
      return {
        success: true,
        messageId: data.messageId,
        sentAt: data.sentAt,
        recipient: data.recipient
      };

    } catch (error: any) {
      console.error('❌ [HOOK] Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Falha no envio do convite por email.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsSending(false);
    }
  };

  const sendInviteWhatsApp = async (inviteData: {
    inviteId: string;
    phone: string;
    token: string;
    recipientName: string;
    invitedByName: string;
    roleName: string;
    notes?: string;
  }): Promise<InviteSendResult> => {
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-invite-whatsapp', {
        body: inviteData
      });

      if (error) {
        console.error('❌ [HOOK] Erro no envio de WhatsApp:', error);
        toast({
          title: "Erro no envio",
          description: "Não foi possível enviar o convite por WhatsApp.",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }
      
      if (data.simulated) {
        toast({
          title: "WhatsApp simulado",
          description: "Envio simulado - configure as credenciais WhatsApp.",
          variant: "default",
        });
      } else {
        toast({
          title: "WhatsApp enviado!",
          description: `Convite enviado para ${inviteData.phone}`,
        });
      }
      
      return {
        success: true,
        messageId: data.messageId,
        sentAt: data.sentAt,
        recipient: data.recipient
      };

    } catch (error: any) {
      console.error('❌ [HOOK] Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Falha no envio do convite por WhatsApp.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsSending(false);
    }
  };

  const processInviteAutomatically = async (inviteId: string): Promise<InviteSendResult> => {
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-invite', {
        body: { inviteId }
      });

      if (error) {
        console.error('❌ [HOOK] Erro no processamento:', error);
        toast({
          title: "Erro no processamento",
          description: "Não foi possível processar o convite automaticamente.",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }
      
      const emailStatus = data.email_sent ? "✅" : "❌";
      const whatsappStatus = data.whatsapp_sent ? "✅" : "⚠️";
      
      toast({
        title: "Convite processado!",
        description: `Email ${emailStatus} | WhatsApp ${whatsappStatus}`,
      });
      
      return {
        success: true,
        sentAt: data.processed_at,
        recipient: `Email: ${data.email_sent ? "Sim" : "Não"}, WhatsApp: ${data.whatsapp_sent ? "Sim" : "Não"}`
      };

    } catch (error: any) {
      console.error('❌ [HOOK] Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Falha no processamento automático do convite.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsSending(false);
    }
  };

  const resendInvite = async (inviteId: string): Promise<InviteSendResult> => {
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.rpc('resend_invite_manual', {
        p_invite_id: inviteId
      });

      if (error || !data.success) {
        console.error('❌ [HOOK] Erro no reenvio:', error || data.error);
        toast({
          title: "Erro no reenvio",
          description: data.error || "Não foi possível reenviar o convite.",
          variant: "destructive",
        });
        return { success: false, error: data.error || error?.message };
      }

      toast({
        title: "Convite reenviado!",
        description: `Convite para ${data.email} foi reenviado com sucesso.`,
      });
      
      return {
        success: true,
        sentAt: data.sent_at,
        recipient: data.email
      };

    } catch (error: any) {
      console.error('❌ [HOOK] Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Falha no reenvio do convite.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    sendInviteEmail,
    sendInviteWhatsApp,
    processInviteAutomatically,
    resendInvite
  };
};