
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

interface InviteFlowResult {
  success: boolean;
  message: string;
  shouldRedirectToOnboarding?: boolean;
}

export const useInviteFlow = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { setProfile, user } = useAuth();

  const acceptInvite = async (token: string): Promise<InviteFlowResult> => {
    if (!token) {
      return {
        success: false,
        message: 'Token de convite não fornecido'
      };
    }

    setIsProcessing(true);

    try {
      console.log('[USE-INVITE-FLOW] Iniciando aceitação de convite:', token);

      // Chamar a função do Supabase para processar o convite
      const { data, error } = await supabase.rpc('accept_invite', {
        p_token: token
      });

      console.log('[USE-INVITE-FLOW] Resultado da aceitação:', { data, error });

      if (error) {
        console.error('[USE-INVITE-FLOW] Erro ao aceitar convite:', error);
        
        const errorMessage = error.message.includes('not found') || error.message.includes('expired')
          ? 'Convite não encontrado, expirado ou já utilizado'
          : `Erro ao processar convite: ${error.message}`;
          
        return {
          success: false,
          message: errorMessage
        };
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'Convite não encontrado ou já utilizado'
        };
      }

      // Recarregar perfil do usuário se estiver logado
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles:role_id (
              id,
              name,
              description,
              permissions,
              is_system
            )
          `)
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile({
            ...profileData as any,
            email: profileData.email || user.email || '',
          } as any);
        }
      }

      logger.info('Convite aceito com sucesso', {
        component: 'useInviteFlow',
        token: token.substring(0, 8) + '***'
      });

      return {
        success: true,
        message: 'Convite aceito com sucesso! Bem-vindo à plataforma.',
        shouldRedirectToOnboarding: false
      };

    } catch (error: any) {
      console.error('[USE-INVITE-FLOW] Erro inesperado:', error);
      
      logger.error('Erro inesperado ao aceitar convite', error, {
        component: 'useInviteFlow'
      });

      return {
        success: false,
        message: 'Erro inesperado ao processar convite'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const applyInviteToExistingUser = async (token: string): Promise<InviteFlowResult> => {
    console.log('[USE-INVITE-FLOW] Aplicando convite a usuário existente:', token);
    
    // Reutilizar a mesma lógica
    return await acceptInvite(token);
  };

  return {
    acceptInvite,
    applyInviteToExistingUser,
    isProcessing
  };
};
