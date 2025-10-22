
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { SendInviteResponse, WhatsAppInviteData } from './types';
import { APP_CONFIG } from '@/config/app';

export function useInviteChannelService() {
  const [sendingChannels, setSendingChannels] = useState<Set<string>>(new Set());

  const getInviteLink = useCallback((token: string) => {
    if (!token) {
      console.error("Erro: Token vazio ao gerar link de convite");
      return "";
    }
    const cleanToken = token.trim().replace(/\s+/g, '');
    const baseUrl = APP_CONFIG.getAppUrl(`/convite/${cleanToken}`);
    
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
      // Timeout para a chamada da edge function
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na chamada da edge function (45s)')), 45000)
      })
      
      const invokePromise = supabase.functions.invoke('send-whatsapp-invite', {
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
      })
      
      const { data, error } = await Promise.race([invokePromise, timeoutPromise]) as any
      
      if (error) {
        console.error('❌ [WHATSAPP-SEND] Erro da edge function:', error);
        throw new Error(`Erro da função: ${error.message}`)
      }
      
      if (!data || !data.success) {
        console.error('❌ [WHATSAPP-SEND] Função reportou falha:', data);
        throw new Error(data?.message || data?.error || 'Resposta inválida da função')
      }
      
      return {
        success: true,
        message: 'WhatsApp enviado com sucesso',
        whatsappId: data.whatsappId,
        strategy: data.strategy,
        method: data.method,
        channel: 'whatsapp'
      };
      
    } catch (err: any) {
      console.error('❌ [WHATSAPP-SEND] Erro fatal:', {
        message: err.message,
        stack: err.stack?.split('\n')[0] // Apenas primeira linha do stack
      });
      
      // Identificar tipo de erro para melhor feedback
      let errorMessage = 'Erro ao enviar WhatsApp'
      let suggestion = 'Verifique o número e tente novamente'
      
      if (err.message?.includes('Timeout')) {
        errorMessage = 'Timeout no envio do WhatsApp'
        suggestion = 'Servidor demorou muito para responder - tente novamente'
      } else if (err.message?.includes('Failed to send a request')) {
        errorMessage = 'Falha na comunicação com o servidor'
        suggestion = 'Problema de conectividade - verifique sua conexão'
      } else if (err.message?.includes('Credenciais')) {
        errorMessage = 'Configuração do WhatsApp incompleta'
        suggestion = 'Entre em contato com o administrador'
      }
      
      return {
        success: false,
        message: errorMessage,
        error: `${err.message} - ${suggestion}`,
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
          console.error("❌ [HYBRID] ERRO WhatsApp:", whatsappResult.error);
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
