
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SendInviteResponse } from './types';

interface SendInviteEmailParams {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
}

export function useInviteEmailService() {
  // Função para enviar email de convite
  const sendInviteEmail = useCallback(async ({
    email,
    inviteUrl,
    roleName,
    expiresAt,
    senderName,
    notes,
    inviteId
  }: SendInviteEmailParams): Promise<SendInviteResponse> => {
    try {
      // Verificar se o URL está correto antes de enviar
      const urlPattern = new RegExp('^https?://[a-z0-9-]+(\\.[a-z0-9-]+)+([/?].*)?$', 'i');
      if (!urlPattern.test(inviteUrl)) {
        console.error("URL inválida gerada para o convite:", inviteUrl);
        return {
          success: false,
          message: 'Erro ao gerar URL do convite',
          error: 'URL inválida gerada'
        };
      }
      
      // Chamar a edge function para envio de email
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId // Passar o ID do convite para atualizar estatísticas
        }
      });
      
      if (error) {
        console.error("Erro ao chamar a edge function:", error);
        throw error;
      }
      
      console.log("Resposta da edge function:", data);
      
      if (!data.success) {
        console.error("Edge function reportou erro:", data.error || data.message);
        throw new Error(data.message || data.error || 'Erro ao enviar e-mail');
      }
      
      return {
        success: true,
        message: 'Email enviado com sucesso'
      };
    } catch (err: any) {
      console.error('Erro ao enviar email de convite:', err);
      return {
        success: false,
        message: 'Erro ao enviar email de convite',
        error: err.message
      };
    }
  }, []);

  // Gerar link de convite - MELHORADO para maior robustez
  const getInviteLink = useCallback((token: string) => {
    // Verificar se o token existe e tem o formato esperado
    if (!token) {
      console.error("Erro: Token vazio ao gerar link de convite");
      return "";
    }
    
    console.log("Gerando link de convite para token:", token, "comprimento:", token.length);
    
    // Limpar o token de possíveis caracteres problemáticos
    const cleanToken = token.trim().replace(/\s+/g, '');
    
    if (cleanToken !== token) {
      console.warn("Token foi limpo antes de gerar o link. Original:", token, "Limpo:", cleanToken);
    }
    
    // Construir URL absoluta com origem da janela atual
    const baseUrl = `${window.location.origin}/convite/${cleanToken}`;
    console.log("URL do convite gerado:", baseUrl);
    
    return baseUrl;
  }, []);

  return {
    sendInviteEmail,
    getInviteLink
  };
}
