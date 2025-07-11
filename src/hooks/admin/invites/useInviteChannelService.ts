
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { SendInviteResponse, WhatsAppInviteData } from './types';

export function useInviteChannelService() {
  const [sendingChannels, setSendingChannels] = useState<Set<string>>(new Set());

  const getInviteLink = useCallback((token: string) => {
    if (!token) {
      console.error("Erro: Token vazio ao gerar link de convite");
      return "";
    }
    
    const { APP_CONFIG } = require('@/config/app');
    const cleanToken = token.trim().replace(/\s+/g, '');
    const baseUrl = APP_CONFIG.getAppUrl(`/convite/${cleanToken}`);
    console.log("URL do convite gerado:", baseUrl);
    
    return baseUrl;
  }, []);

  const sendEmailInvite = useCallback(async ({
    email,
    inviteUrl,
    roleName,
    expiresAt,
    senderName,
    notes,
    inviteId,
    forceResend = false
  }: {
    email: string;
    inviteUrl: string;
    roleName: string;
    expiresAt: string;
    senderName?: string;
    notes?: string;
    inviteId?: string;
    forceResend?: boolean;
  }): Promise<SendInviteResponse> => {
    try {
      console.log("📧 Enviando email para:", email);
      
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId,
          forceResend
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message || data.error);
      
      return {
        success: true,
        message: 'Email enviado com sucesso',
        emailId: data.emailId,
        strategy: data.strategy,
        method: data.method,
        channel: 'email'
      };
    } catch (err: any) {
      console.error('❌ Erro ao enviar email:', err);
      return {
        success: false,
        message: 'Erro ao enviar email',
        error: err.message,
        channel: 'email'
      };
    }
  }, []);

  const sendWhatsAppInvite = useCallback(async ({
    phone,
    inviteUrl,
    roleName,
    expiresAt,
    senderName,
    notes,
    inviteId,
    email
  }: WhatsAppInviteData): Promise<SendInviteResponse> => {
    try {
      console.log("📱 Enviando WhatsApp para:", phone);
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp-invite', {
        body: {
          phone,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId,
          email
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message || data.error);
      
      return {
        success: true,
        message: 'WhatsApp enviado com sucesso',
        whatsappId: data.whatsappId,
        strategy: data.strategy,
        method: data.method,
        channel: 'whatsapp'
      };
    } catch (err: any) {
      console.error('❌ Erro ao enviar WhatsApp:', err);
      return {
        success: false,
        message: 'Erro ao enviar WhatsApp',
        error: err.message,
        channel: 'whatsapp'
      };
    }
  }, []);

  const sendHybridInvite = useCallback(async ({
    email,
    phone,
    inviteUrl,
    roleName,
    expiresAt,
    senderName,
    notes,
    inviteId,
    channelPreference = 'email'
  }: {
    email: string;
    phone?: string;
    inviteUrl: string;
    roleName: string;
    expiresAt: string;
    senderName?: string;
    notes?: string;
    inviteId?: string;
    channelPreference?: 'email' | 'whatsapp' | 'both';
  }): Promise<SendInviteResponse> => {
    const channelKey = `${inviteId}-${channelPreference}`;
    setSendingChannels(prev => new Set(prev).add(channelKey));

    try {
      console.log("🔄 Enviando convite híbrido - Canal:", channelPreference);

      let emailResult: SendInviteResponse | null = null;
      let whatsappResult: SendInviteResponse | null = null;
      let hasError = false;
      let errors: string[] = [];

      // Determinar quais canais enviar
      const shouldSendEmail = channelPreference === 'email' || channelPreference === 'both';
      const shouldSendWhatsApp = (channelPreference === 'whatsapp' || channelPreference === 'both') && phone;

      // Enviar por email
      if (shouldSendEmail) {
        emailResult = await sendEmailInvite({
          email,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId,
          forceResend: true
        });

        if (!emailResult.success) {
          hasError = true;
          errors.push(`Email: ${emailResult.error}`);
        }
      }

      // Enviar por WhatsApp
      if (shouldSendWhatsApp) {
        whatsappResult = await sendWhatsAppInvite({
          phone: phone!,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId,
          email
        });

        if (!whatsappResult.success) {
          hasError = true;
          errors.push(`WhatsApp: ${whatsappResult.error}`);
        }
      }

      // Determinar resultado final
      const emailSuccess = emailResult?.success ?? false;
      const whatsappSuccess = whatsappResult?.success ?? false;
      const anySuccess = emailSuccess || whatsappSuccess;

      if (!anySuccess && hasError) {
        return {
          success: false,
          message: 'Falha ao enviar por todos os canais',
          error: errors.join(', '),
          channel: channelPreference
        };
      }

      // Construir mensagem de sucesso
      let successMessage = '';
      const sentChannels: string[] = [];

      if (emailSuccess) sentChannels.push('email');
      if (whatsappSuccess) sentChannels.push('WhatsApp');

      if (sentChannels.length === 2) {
        successMessage = 'Convite enviado via email e WhatsApp';
      } else if (sentChannels.length === 1) {
        successMessage = `Convite enviado via ${sentChannels[0]}`;
        if (hasError) {
          successMessage += ` (${sentChannels[0] === 'email' ? 'WhatsApp' : 'email'} falhou)`;
        }
      }

      return {
        success: true,
        message: successMessage,
        emailId: emailResult?.emailId,
        whatsappId: whatsappResult?.whatsappId,
        strategy: 'hybrid',
        method: sentChannels.join('+'),
        channel: channelPreference
      };

    } catch (error: any) {
      console.error('❌ Erro no envio híbrido:', error);
      return {
        success: false,
        message: 'Erro no sistema híbrido de envio',
        error: error.message,
        channel: channelPreference
      };
    } finally {
      setSendingChannels(prev => {
        const newSet = new Set(prev);
        newSet.delete(channelKey);
        return newSet;
      });
    }
  }, [sendEmailInvite, sendWhatsAppInvite]);

  return {
    getInviteLink,
    sendEmailInvite,
    sendWhatsAppInvite,
    sendHybridInvite,
    sendingChannels
  };
}
