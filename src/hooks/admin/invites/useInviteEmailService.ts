
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
      
      console.log("Enviando convite por email: ", {
        email,
        inviteUrl,
        roleName
      });
      
      // Verificar se o usuário já está cadastrado consultando a tabela de perfis
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      let emailType = existingProfile ? 'existing_user' : 'new_user';
      console.log(`Tipo de destinatário: ${emailType} para ${email}`);
      
      // Chamar a edge function para envio de email
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId,
          userType: emailType // Informa se é um usuário novo ou existente
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

  // Gerar link de convite - Melhorado para robustez máxima
  const getInviteLink = useCallback((token: string) => {
    // Verificar se o token existe
    if (!token) {
      console.error("Erro: Token vazio ao gerar link de convite");
      return "";
    }
    
    // Limpar o token de espaços e normalizar
    const cleanToken = token.trim().replace(/[\\s\\n\\r\\t]+/g, '');
    
    console.log("Gerando link de convite para token:", {
      original: token,
      limpo: cleanToken,
      comprimento: cleanToken.length
    });
    
    // Verificação de integridade do token
    if (!cleanToken.match(/^[A-Z0-9]+$/i)) {
      console.warn("Token contém caracteres não alfanuméricos:", token);
    }
    
    // Construir URL absoluta com origem da janela atual
    const baseUrl = `${window.location.origin}/convite/${encodeURIComponent(cleanToken)}`;
    console.log("URL do convite gerado:", baseUrl);
    
    return baseUrl;
  }, []);

  return {
    sendInviteEmail,
    getInviteLink
  };
}
