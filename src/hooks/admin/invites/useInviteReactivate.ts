import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Invite } from './types';

interface ReactivateInviteResponse {
  success: boolean;
  message: string;
  new_expires_at?: string;
  error?: string;
}

export const useInviteReactivate = () => {
  const [isReactivating, setIsReactivating] = useState(false);

  const reactivateInvite = async (invite: Invite, daysExtension: number = 7): Promise<boolean> => {
    setIsReactivating(true);

    try {
      // Verificar se o convite está expirado
      const isExpired = new Date(invite.expires_at) <= new Date();
      if (!isExpired) {
        toast({
          title: "Convite ativo",
          description: "Este convite ainda não está expirado",
          variant: "destructive"
        });
        return false;
      }

      // Verificar se o convite não foi usado
      if (invite.used_at) {
        toast({
          title: "Convite já utilizado",
          description: "Não é possível reativar um convite que já foi utilizado",
          variant: "destructive"
        });
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
        toast({
          title: "Convite reativado!",
          description: response.message,
          variant: "default"
        });
        return true;
      } else {
        toast({
          title: "Erro ao reativar",
          description: response.error || "Erro desconhecido",
          variant: "destructive"
        });
        return false;
      }

    } catch (error) {
      console.error('Erro ao reativar convite:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar reativar o convite. Tente novamente.",
        variant: "destructive"
      });
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