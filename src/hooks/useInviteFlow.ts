
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface InviteFlowResult {
  success: boolean;
  message: string;
  shouldRedirectToOnboarding?: boolean;
  shouldRedirectToLogin?: boolean;
}

export const useInviteFlow = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { signUp } = useAuth();

  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[INVITE-FLOW] Erro ao verificar usuário:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('[INVITE-FLOW] Erro na verificação:', error);
      return false;
    }
  };

  const applyInviteToExistingUser = async (token: string, userId: string): Promise<InviteFlowResult> => {
    try {
      console.log('[INVITE-FLOW] Aplicando convite a usuário existente:', { token, userId });

      const result = await supabase.rpc('use_invite', {
        invite_token: token,
        user_id: userId
      });

      if (result.error) {
        console.error('[INVITE-FLOW] Erro ao aplicar convite:', result.error);
        return {
          success: false,
          message: 'Erro ao aplicar convite: ' + result.error.message
        };
      }

      const data = result.data;
      if (data?.status === 'success') {
        logger.info('Convite aplicado com sucesso a usuário existente', {
          component: 'useInviteFlow',
          userId,
          token
        });

        return {
          success: true,
          message: 'Convite aplicado com sucesso!',
          shouldRedirectToOnboarding: true
        };
      } else {
        return {
          success: false,
          message: data?.message || 'Erro ao aplicar convite'
        };
      }
    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro inesperado:', error);
      return {
        success: false,
        message: 'Erro inesperado: ' + error.message
      };
    }
  };

  const registerWithInvite = async (
    email: string, 
    password: string, 
    name: string, 
    token: string
  ): Promise<InviteFlowResult> => {
    try {
      setIsProcessing(true);

      // Verificar se usuário já existe
      const userExists = await checkUserExists(email);
      if (userExists) {
        console.log('[INVITE-FLOW] Usuário já existe, precisa fazer login');
        return {
          success: false,
          message: 'Esta conta já existe. Faça login para aplicar o convite.',
          shouldRedirectToLogin: true
        };
      }

      console.log('[INVITE-FLOW] Criando nova conta com convite:', { email, name, token });

      // Criar conta nova
      const { error: signUpError } = await signUp(email, password, {
        name: name.trim(),
        full_name: name.trim(),
        invite_token: token
      });

      if (signUpError) {
        console.error('[INVITE-FLOW] Erro no registro:', signUpError);
        
        // Verificar se é erro de usuário já existente
        if (signUpError.message?.includes('User already registered')) {
          return {
            success: false,
            message: 'Esta conta já existe. Faça login para aplicar o convite.',
            shouldRedirectToLogin: true
          };
        }
        
        return {
          success: false,
          message: 'Erro ao criar conta: ' + signUpError.message
        };
      }

      logger.info('Conta criada com sucesso via convite', {
        component: 'useInviteFlow',
        email,
        token
      });

      return {
        success: true,
        message: 'Conta criada com sucesso!',
        shouldRedirectToOnboarding: true
      };

    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro inesperado no registro:', error);
      return {
        success: false,
        message: 'Erro inesperado: ' + error.message
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    checkUserExists,
    applyInviteToExistingUser,
    registerWithInvite
  };
};
