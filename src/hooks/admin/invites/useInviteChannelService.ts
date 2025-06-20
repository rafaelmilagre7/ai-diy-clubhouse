
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { SendInviteResponse, WhatsAppInviteData } from './types';

export function useInviteChannelService() {
  const [sendingChannels, setSendingChannels] = useState<Set<string>>(new Set());

  const getInviteLink = useCallback((token: string) => {
    if (!token) {
      console.error("❌ Token vazio ao gerar link de convite");
      return "";
    }
    
    const cleanToken = token.trim().replace(/\s+/g, '');
    const baseUrl = `${window.location.origin}/convite/${cleanToken}`;
    console.log("🔗 URL do convite gerado:", baseUrl);
    
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
    const requestId = crypto.randomUUID().substring(0, 8);
    
    try {
      console.log(`📧 [${requestId}] Iniciando envio de email para:`, email);
      console.log(`📧 [${requestId}] Configuração:`, { 
        inviteUrl: inviteUrl.substring(0, 50), 
        roleName, 
        forceResend, 
        inviteId 
      });

      // Timeout de 30 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error(`⏰ [${requestId}] Timeout após 30s`);
      }, 30000);

      console.log(`🔄 [${requestId}] Chamando Edge Function send-invite-email...`);
      
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId,
          forceResend,
          requestId
        }
      });

      clearTimeout(timeoutId);

      console.log(`📧 [${requestId}] Resposta da Edge Function:`, { 
        data: data || 'null', 
        error: error || 'null' 
      });
      
      if (error) {
        console.error(`❌ [${requestId}] Erro da Edge Function:`, error);
        throw new Error(`Edge Function Error: ${error.message || JSON.stringify(error)}`);
      }
      
      if (!data) {
        console.error(`❌ [${requestId}] Dados vazios da Edge Function`);
        throw new Error('Edge Function retornou dados vazios');
      }

      if (!data.success) {
        console.error(`❌ [${requestId}] Edge Function retornou falha:`, data);
        throw new Error(data.message || data.error || 'Falha não especificada');
      }
      
      console.log(`✅ [${requestId}] Email enviado com sucesso via ${data.strategy || 'unknown'}`);
      
      return {
        success: true,
        message: 'Email enviado com sucesso',
        emailId: data.emailId,
        strategy: data.strategy,
        method: data.method,
        channel: 'email'
      };
    } catch (err: any) {
      console.error(`❌ [${requestId}] Erro ao enviar email:`, err);
      
      // Verificar se é erro de timeout
      if (err.name === 'AbortError') {
        return {
          success: false,
          message: 'Timeout ao enviar email (30s)',
          error: 'Conexão com servidor demorou mais que 30 segundos',
          suggestion: 'Verifique sua conexão e tente novamente',
          channel: 'email'
        };
      }

      // Verificar se é erro de conectividade
      if (err.message?.includes('network') || err.message?.includes('fetch')) {
        return {
          success: false,
          message: 'Erro de conectividade',
          error: 'Falha na conexão com o servidor',
          suggestion: 'Verifique sua conexão de internet e tente novamente',
          channel: 'email'
        };
      }
      
      return {
        success: false,
        message: 'Erro ao enviar email',
        error: err.message || 'Erro desconhecido',
        suggestion: 'Verifique as configurações e tente novamente',
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
    inviteId
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
          inviteId
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

  return {
    getInviteLink,
    sendEmailInvite,
    sendWhatsAppInvite,
    sendingChannels
  };
}
