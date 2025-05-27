
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useInviteEmailService } from './useInviteEmailService';

export function useInviteCreate() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<Error | null>(null);
  const { 
    sendInviteEmail, 
    getInviteLink, 
    pendingEmails, 
    retryAllPendingEmails 
  } = useInviteEmailService();

  const createInvite = useCallback(async (email: string, roleId: string, notes?: string, expiresIn: string = '7 days') => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }
    
    try {
      setIsCreating(true);
      setCreateError(null);
      
      console.log("🚀 Iniciando criação de convite para:", email);
      
      // Validações básicas
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Formato de email inválido");
      }
      
      if (!roleId) {
        throw new Error("Papel não selecionado");
      }
      
      console.log("✅ Validações OK, criando convite no banco...");
      
      // Usar a função RPC create_invite
      const { data, error } = await supabase.rpc('create_invite', {
        p_email: email,
        p_role_id: roleId,
        p_expires_in: expiresIn,
        p_notes: notes
      });
      
      if (error) {
        console.error("❌ Erro ao criar convite via RPC:", error);
        throw error;
      }
      
      if (data.status === 'error') {
        console.error("❌ Erro retornado pela função create_invite:", data.message);
        throw new Error(data.message);
      }
      
      console.log("✅ Convite criado no banco:", {
        inviteId: data.invite_id,
        token: data.token ? 'presente' : 'ausente',
        expiresAt: data.expires_at
      });
      
      // Validar token
      if (!data.token || typeof data.token !== 'string' || data.token.length < 8) {
        console.error("❌ Token inválido:", data.token);
        throw new Error("Erro interno: token de convite inválido");
      }
      
      // Buscar dados do papel
      console.log("📋 Buscando dados do papel...");
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', roleId)
        .maybeSingle();

      if (roleError) {
        console.error("⚠️ Erro ao buscar papel:", roleError);
      }

      const roleName = roleData?.name || 'membro';
      const inviteUrl = getInviteLink(data.token);
      
      if (!inviteUrl) {
        throw new Error("Erro ao gerar link do convite");
      }
      
      console.log("📧 Enviando email (sistema aprimorado)...");
      
      // Enviar email com sistema aprimorado
      const sendResult = await sendInviteEmail({
        email,
        inviteUrl,
        roleName,
        expiresAt: data.expires_at,
        senderName: user.user_metadata?.name || user.email,
        notes,
        inviteId: data.invite_id
      });
      
      console.log("📨 Resultado do envio:", sendResult);
      
      // Feedback baseado no resultado
      if (sendResult.success) {
        toast.success('Convite criado e enviado!', {
          description: `${sendResult.message} para ${email}`
        });
      } else {
        toast.warning('Convite criado com sucesso', {
          description: `O convite foi salvo no sistema. ${sendResult.error || 'Tente reenviar se necessário.'}`
        });
      }
      
      return {
        ...data,
        emailStatus: sendResult.success ? 'sent' : 'pending',
        emailError: sendResult.success ? null : sendResult.error
      };
      
    } catch (err: any) {
      console.error('❌ Erro ao criar convite:', err);
      setCreateError(err);
      
      if (err.message?.includes('Formato de email inválido')) {
        toast.error('Email inválido', {
          description: 'Verifique o formato do email'
        });
      } else {
        toast.error('Erro ao criar convite', {
          description: err.message || 'Tente novamente'
        });
      }
      
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user, sendInviteEmail, getInviteLink, retryAllPendingEmails]);

  return {
    isCreating,
    createInvite,
    pendingEmails,
    createError,
    retryAllPendingEmails
  };
}
