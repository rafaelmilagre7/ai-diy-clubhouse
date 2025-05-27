
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
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
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<Error | null>(null);

  const sendInviteEmail = useCallback(async ({
    email,
    inviteUrl,
    roleName,
    expiresAt,
    senderName,
    notes,
    inviteId,
  }: SendInviteEmailParams): Promise<SendInviteResponse> => {
    try {
      setIsSending(true);
      setSendError(null);

      console.log("🚀 Enviando convite:", { email, roleName });

      // Validações
      if (!email?.includes('@')) {
        throw new Error('Email inválido');
      }

      if (!inviteUrl) {
        throw new Error('URL do convite não fornecida');
      }

      // Verificar se o email já foi convidado recentemente
      const { data: existingInvites } = await supabase
        .from('invites')
        .select('id, used_at, expires_at')
        .eq('email', email)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24h
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingInvites && existingInvites.length > 0) {
        const recentInvite = existingInvites[0];
        if (!recentInvite.used_at && new Date(recentInvite.expires_at) > new Date()) {
          console.warn("⚠️ Email já foi convidado recentemente");
          toast.warning('Email já foi convidado recentemente', {
            description: 'Aguarde antes de enviar outro convite para o mesmo email.'
          });
        }
      }

      // Chamar edge function
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId
        }
      });

      if (error) {
        console.error("❌ Erro da edge function:", error);
        throw new Error(`Erro no envio: ${error.message}`);
      }

      if (!data?.success) {
        console.error("❌ Falha reportada:", data);
        throw new Error(data?.message || 'Falha no envio');
      }

      console.log("✅ Email enviado:", data);

      return {
        success: true,
        message: data.method === 'custom_link' 
          ? 'Convite enviado para usuário existente' 
          : 'Convite enviado para novo usuário',
        emailId: data.user_id
      };

    } catch (err: any) {
      console.error("❌ Erro no envio:", err);
      setSendError(err);

      return {
        success: false,
        message: 'Erro ao enviar email',
        error: err.message
      };
    } finally {
      setIsSending(false);
    }
  }, []);

  const getInviteLink = useCallback((token: string) => {
    if (!token?.trim()) {
      console.error("❌ Token vazio");
      return "";
    }

    const cleanToken = token.trim();
    const baseUrl = `${window.location.origin}/convite/${encodeURIComponent(cleanToken)}`;
    
    console.log("🔗 Link gerado:", baseUrl);
    return baseUrl;
  }, []);

  return {
    sendInviteEmail,
    getInviteLink,
    isSending,
    sendError,
    pendingEmails: 0,
    retryAllPendingEmails: () => {},
    clearEmailQueue: () => {},
    emailQueue: []
  };
}
