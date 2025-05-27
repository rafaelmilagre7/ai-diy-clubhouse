
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
      
      // Validações básicas apenas
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Formato de email inválido");
      }
      
      if (!roleId) {
        throw new Error("Papel não selecionado");
      }
      
      console.log("✅ Verificações passaram, criando convite...");
      
      // Usar a função RPC create_invite para criar o convite
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
      
      console.log("✅ Convite criado com sucesso:", {
        inviteId: data.invite_id,
        token: data.token ? 'presente' : 'ausente',
        expiresAt: data.expires_at
      });
      
      // Validar o token gerado
      if (!data.token || typeof data.token !== 'string' || data.token.length < 8) {
        console.error("❌ Token gerado é inválido:", data.token);
        throw new Error("Erro interno: token de convite inválido gerado");
      }
      
      // Buscar dados do papel para o email
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
      
      // Gerar link do convite
      const inviteUrl = getInviteLink(data.token);
      
      if (!inviteUrl) {
        throw new Error("Erro ao gerar link do convite");
      }
      
      console.log("📧 Enviando email de convite...");
      
      // Enviar email de convite
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
      
      // Determinar mensagem baseada no resultado
      if (sendResult.success) {
        toast.success('Convite criado e enviado com sucesso!', {
          description: `${sendResult.message} para ${email}.`
        });
      } else {
        // Mostrar aviso mas não falhar - convite foi criado
        toast.warning('Convite criado com sucesso', {
          description: `O convite foi criado, mas pode haver atraso no envio do email. Tente reenviar se necessário.`
        });
      }
      
      return {
        ...data,
        emailStatus: sendResult.success ? 'sent' : 'pending',
        emailError: sendResult.success ? null : sendResult.error
      };
      
    } catch (err: any) {
      console.error('❌ Erro geral ao criar convite:', err);
      setCreateError(err);
      
      // Mensagens de erro mais específicas
      if (err.message?.includes('Formato de email inválido')) {
        toast.error('Email inválido', {
          description: 'Por favor, verifique o formato do email.'
        });
      } else {
        toast.error('Erro ao criar convite', {
          description: err.message || 'Não foi possível criar o convite.'
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
