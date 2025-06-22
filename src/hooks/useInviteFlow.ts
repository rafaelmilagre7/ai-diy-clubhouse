
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

    if (!user?.id) {
      return {
        success: false,
        message: 'Usuário deve estar logado para aceitar convite'
      };
    }

    setIsProcessing(true);

    try {
      console.log('[USE-INVITE-FLOW] Usando função use_invite com token:', token.substring(0, 8) + '...');

      // Usar a função use_invite que existe no banco
      const { data, error } = await supabase.rpc('use_invite', {
        invite_token: token,
        user_id: user.id
      });

      console.log('[USE-INVITE-FLOW] Resultado de use_invite:', { data, error });

      if (error) {
        console.error('[USE-INVITE-FLOW] Erro ao usar convite:', error);
        
        const errorMessage = error.message.includes('não encontrado') || error.message.includes('inválido')
          ? 'Convite não encontrado, expirado ou já utilizado'
          : `Erro ao processar convite: ${error.message}`;
          
        return {
          success: false,
          message: errorMessage
        };
      }

      // Verificar se a resposta indica sucesso
      if (!data || (typeof data === 'object' && data.status === 'error')) {
        const errorMsg = (typeof data === 'object' && data.message) || 'Convite não encontrado ou já utilizado';
        return {
          success: false,
          message: errorMsg
        };
      }

      // Recarregar perfil do usuário para refletir mudanças de role
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
        console.log('[USE-INVITE-FLOW] Atualizando perfil com novos dados:', {
          email: profileData.email || user.email,
          role: profileData.user_roles?.name
        });
        
        setProfile({
          ...profileData as any,
          email: profileData.email || user.email || '',
        } as any);
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
    console.log('[USE-INVITE-FLOW] Aplicando convite a usuário existente:', token.substring(0, 8) + '...');
    
    // Usar a mesma lógica do acceptInvite
    return await acceptInvite(token);
  };

  return {
    acceptInvite,
    applyInviteToExistingUser,
    isProcessing
  };
};
