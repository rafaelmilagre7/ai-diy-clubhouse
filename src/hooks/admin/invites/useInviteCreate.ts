
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { generateInviteUrl } from '@/utils/inviteValidationUtils';
import { useInviteEmailFallback } from './useInviteEmailFallback';

export const useInviteCreate = () => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const { sendInviteWithFallback } = useInviteEmailFallback();

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

      // NOVO: Usar sistema de fallback para envio
      const sendResult = await sendInviteWithFallback({
        email,
        inviteUrl,
        roleName: roleData?.name || 'membro',
        expiresAt: data.expires_at,
        senderName: user.user_metadata?.name || user.email,
        notes,
        inviteId: data.invite_id
      });

      // Feedback baseado no método usado
      if (sendResult.success) {
        let successMessage = 'Convite criado e enviado com sucesso!';
        let description = '';
        
        switch (sendResult.method) {
          case 'edge_function':
            description = 'Enviado via sistema principal com design profissional';
            break;
          case 'supabase_auth':
            description = 'Enviado via sistema de backup (email em inglês)';
            break;
        }
        
        toast.success(successMessage, { description });
      } else {
        console.warn("⚠️ [INVITE-CREATE] Problema no envio:", sendResult.error);
        toast.warning('Convite criado, mas houve problema no envio', {
          description: sendResult.error || 'O sistema tentará reenviar automaticamente.'
        });
      }

      return data;
    } catch (err: any) {
      console.error('❌ [INVITE-CREATE] Erro crítico:', err);
      toast.error('Erro ao criar convite', {
        description: err.message || 'Não foi possível criar o convite.'
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createInvite, isCreating };
};
