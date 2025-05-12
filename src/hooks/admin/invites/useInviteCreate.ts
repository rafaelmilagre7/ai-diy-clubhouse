
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { SendInviteResponse } from './types';
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

  // Criar novo convite
  const createInvite = useCallback(async (email: string, roleId: string, notes?: string, expiresIn: string = '7 days') => {
    if (!user) return null;
    
    try {
      setIsCreating(true);
      setCreateError(null);
      
      // Validar email básico (simples mas evita erros óbvios)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Formato de email inválido");
      }
      
      console.log("Criando convite para", email, "com papel", roleId);
      
      // Usar a função RPC create_invite para criar o convite
      const { data, error } = await supabase.rpc('create_invite', {
        p_email: email,
        p_role_id: roleId,
        p_expires_in: expiresIn,
        p_notes: notes
      });
      
      if (error) {
        console.error("Erro ao criar convite via RPC:", error);
        throw error;
      }
      
      if (data.status === 'error') {
        console.error("Erro retornado pela função create_invite:", data.message);
        throw new Error(data.message);
      }
      
      console.log("Convite criado:", data);
      
      // Verificar se o token está no formato esperado
      if (!data.token || typeof data.token !== 'string' || data.token.length < 6) {
        console.error("Token gerado é inválido ou muito curto:", data.token);
        throw new Error("Erro ao gerar token de convite");
      }
      
      // Enviar email de convite
      const inviteUrl = getInviteLink(data.token);
      console.log("Link de convite gerado:", inviteUrl);
      
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', roleId)
        .maybeSingle(); // Usando maybeSingle() em vez de single() para evitar erro se não encontrar

      const sendResult = await sendInviteEmail({
        email,
        inviteUrl,
        roleName: roleData?.name || 'membro',
        expiresAt: data.expires_at,
        senderName: user.user_metadata?.name,
        notes,
        inviteId: data.invite_id
      });
      
      console.log("Resultado do envio:", sendResult);
      
      if (!sendResult.success) {
        toast.warning('Convite criado, mas houve um erro ao enviar o e-mail', {
          description: 'O sistema tentará reenviar o e-mail automaticamente em breve.',
          action: {
            label: 'Tentar Agora',
            onClick: () => retryAllPendingEmails()
          }
        });
      } else {
        toast.success('Convite criado com sucesso', {
          description: `Um convite para ${email} foi criado e enviado por email.`
        });
      }
      
      return {
        ...data,
        emailStatus: sendResult.success ? 'sent' : 'pending'
      };
    } catch (err: any) {
      console.error('Erro ao criar convite:', err);
      setCreateError(err);
      toast.error('Erro ao criar convite', {
        description: err.message || 'Não foi possível criar o convite.'
      });
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
