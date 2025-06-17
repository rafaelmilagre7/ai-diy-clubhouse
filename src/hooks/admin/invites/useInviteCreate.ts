
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { generateInviteUrl } from '@/utils/inviteValidationUtils';
import { useInviteEmailService } from './useInviteEmailService';

export const useInviteCreate = () => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const { sendInviteEmail } = useInviteEmailService();

  const createInvite = async (
    email: string,
    roleId: string,
    notes?: string,
    expiresIn: string = '7 days',
    phone?: string,
    channelPreference: 'email' | 'whatsapp' | 'both' = 'email'
  ) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      setIsCreating(true);
      
      console.log("🔥 [INVITE-CREATE] Iniciando criação de convite:", {
        email,
        roleId,
        channelPreference,
        hasPhone: !!phone,
        user: user.id
      });

      // Usar a função híbrida corrigida
      const { data, error } = await supabase.rpc('create_invite_hybrid', {
        p_email: email,
        p_role_id: roleId,
        p_phone: phone,
        p_expires_in: `${expiresIn}`,
        p_notes: notes,
        p_channel_preference: channelPreference
      });

      if (error) {
        console.error("❌ [INVITE-CREATE] Erro SQL:", error);
        throw error;
      }

      if (data.status === 'error') {
        console.error("❌ [INVITE-CREATE] Erro na função:", data.message);
        throw new Error(data.message);
      }

      console.log("✅ [INVITE-CREATE] Convite criado com sucesso:", {
        inviteId: data.invite_id,
        token: data.token,
        expiresAt: data.expires_at
      });

      // Gerar URL padronizada
      const inviteUrl = generateInviteUrl(data.token);
      console.log("🔗 [INVITE-CREATE] URL gerada:", inviteUrl);
      
      // Buscar nome do papel para o envio
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', roleId)
        .single();

      if (roleError) {
        console.warn("⚠️ [INVITE-CREATE] Erro ao buscar papel:", roleError);
      }

      console.log("📧 [INVITE-CREATE] Enviando email...");

      // Usar sistema de envio de email
      const sendResult = await sendInviteEmail({
        email,
        inviteUrl,
        roleName: roleData?.name || 'membro',
        expiresAt: data.expires_at,
        senderName: user.user_metadata?.name || user.email,
        notes,
        inviteId: data.invite_id,
        forceResend: true
      });

      console.log("📬 [INVITE-CREATE] Resultado do envio:", sendResult);

      // Mostrar feedback apropriado
      if (sendResult.success) {
        toast.success('Convite criado e enviado com sucesso!', {
          description: sendResult.message
        });
      } else {
        toast.warning('Convite criado, mas houve problema no envio', {
          description: sendResult.error || 'Verifique os logs para mais detalhes'
        });
      }

      return data;
    } catch (err: any) {
      console.error('❌ [INVITE-CREATE] Erro crítico:', err);
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao criar convite';
      let description = err.message || 'Não foi possível criar o convite.';
      
      if (err.message?.includes('já existe')) {
        errorMessage = 'Convite já existe';
        description = 'Este email já possui um convite pendente.';
      } else if (err.message?.includes('role')) {
        errorMessage = 'Papel inválido';
        description = 'O papel selecionado não é válido.';
      } else if (err.message?.includes('email')) {
        errorMessage = 'Email inválido';
        description = 'Verifique se o formato do email está correto.';
      } else if (err.message?.includes('permission')) {
        errorMessage = 'Sem permissão';
        description = 'Você não tem permissão para criar convites.';
      }
      
      toast.error(errorMessage, { description });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createInvite, isCreating };
};
