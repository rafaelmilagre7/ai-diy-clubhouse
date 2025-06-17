
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
      
      console.log("📧 [INVITE-CREATE] Criando convite:", {
        email,
        roleId,
        channelPreference,
        hasPhone: !!phone
      });

      // Usar a função híbrida que suporta diferentes canais
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

      console.log("✅ [INVITE-CREATE] Convite criado:", data);

      // Gerar URL padronizada
      const inviteUrl = generateInviteUrl(data.token);
      
      // Buscar nome do papel para o envio
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', roleId)
        .single();

      // Usar sistema aprimorado de envio de email
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

      // O hook de email já mostra o toast apropriado
      if (!sendResult.success) {
        console.warn("⚠️ [INVITE-CREATE] Problema no envio:", sendResult.error);
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
      }
      
      toast.error(errorMessage, { description });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createInvite, isCreating };
};
