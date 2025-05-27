
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

      // ===== NOVA VERIFICAÇÃO INTELIGENTE =====
      console.log("🔍 Verificando se email pode receber novo convite...");
      
      // Verificar se existe usuário ativo no sistema
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email, name')
        .eq('email', email)
        .maybeSingle();

      if (existingProfile) {
        console.log("❌ Usuário ainda existe no sistema:", existingProfile);
        toast.error('⚠️ Email já cadastrado', {
          description: `${email} já está registrado no sistema. Use o botão 🗑️ para limpar os dados antes de reenviar.`,
          duration: 8000,
          action: {
            label: 'Entendi',
            onClick: () => console.log('User acknowledged existing user')
          }
        });
        return null;
      }

      // Verificar se existe convite pendente válido
      const { data: existingInvite } = await supabase
        .from('invites')
        .select('id, expires_at, used_at')
        .eq('email', email)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (existingInvite) {
        console.log("❌ Convite pendente encontrado:", existingInvite);
        const expiresAt = new Date(existingInvite.expires_at).toLocaleString('pt-BR');
        toast.error('📧 Convite já enviado', {
          description: `Já existe um convite válido para ${email} que expira em ${expiresAt}. Aguarde expirar ou delete o usuário.`,
          duration: 8000
        });
        return null;
      }

      console.log("✅ Email limpo, prosseguindo com criação do convite...");
      
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
      
      console.log("📧 Enviando email (sistema profissional)...");
      
      // Enviar email com sistema aprimorado
      const sendResult = await sendInviteEmail({
        email,
        inviteUrl,
        roleName,
        expiresAt: data.expires_at,
        senderName: user.user_metadata?.name || user.email,
        notes,
        inviteId: data.invite_id,
        forceResend: true // Forçar envio para convites novos após limpeza
      });
      
      console.log("📨 Resultado do envio:", sendResult);
      
      // Feedback baseado no resultado
      if (sendResult.success) {
        toast.success('🎉 Convite criado e enviado!', {
          description: `${sendResult.message} para ${email}. Sistema profissional ativo com alta deliverabilidade.`,
          duration: 6000
        });
      } else {
        toast.warning('✅ Convite criado com sucesso', {
          description: `O convite foi salvo no sistema para ${email}. ${sendResult.error || 'Tente reenviar se necessário.'}`,
          duration: 8000
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
        toast.error('📧 Email inválido', {
          description: 'Verifique o formato do email'
        });
      } else if (err.message?.includes('já está registrado')) {
        // Erro já tratado acima
        return null;
      } else {
        toast.error('❌ Erro ao criar convite', {
          description: err.message || 'Tente novamente ou verifique os logs'
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
