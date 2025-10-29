import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastModern } from '@/hooks/useToastModern';
import { Invite } from './types';

interface ReactivateInviteResponse {
  success: boolean;
  message: string;
  new_expires_at?: string;
  error?: string;
}

export const useInviteReactivate = () => {
  const [isReactivating, setIsReactivating] = useState(false);
  const { showError, showSuccess } = useToastModern();

  const reactivateInvite = async (invite: Invite, daysExtension: number = 7): Promise<boolean> => {
    setIsReactivating(true);

    try {
      // Verificar se o convite está expirado
      const isExpired = new Date(invite.expires_at) <= new Date();
      if (!isExpired) {
        showError("Convite ativo", "Este convite ainda não está expirado");
        return false;
      }

      // Verificar se o convite não foi usado
      if (invite.used_at) {
        showError("Convite já utilizado", "Não é possível reativar um convite que já foi utilizado");
        return false;
      }

      // Chamar função RPC para reativar
      const { data, error } = await supabase.rpc('reactivate_invite_secure', {
        p_invite_id: invite.id,
        p_days_extension: daysExtension
      });

      if (error) {
        console.error('Erro ao reativar convite:', error);
        throw error;
      }

      const response = data as ReactivateInviteResponse;

      if (response.success) {
        showSuccess("Convite reativado!", response.message);
        return true;
      } else {
        showError("Erro ao reativar", response.error || "Erro desconhecido");
        return false;
      }

    } catch (error) {
      console.error('Erro ao reativar convite:', error);
      showError("Erro inesperado", "Ocorreu um erro ao tentar reativar o convite. Tente novamente.");
      return false;
    } finally {
      setIsReactivating(false);
    }
  };

  return {
    reactivateInvite,
    isReactivating
  };
};