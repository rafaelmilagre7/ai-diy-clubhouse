
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

  const validateInvite = async (token: string, email: string) => {
    try {
      console.log('[INVITE-FLOW] Validando convite:', { token: token.substring(0, 8) + '...', email });
      
      const { data, error } = await supabase.rpc('can_use_invite', {
        invite_token: token,
        user_email: email
      });

      if (error) {
        console.error('[INVITE-FLOW] Erro ao validar convite:', error);
        return { valid: false, message: error.message };
      }

      return data;
    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro inesperado na validação:', error);
      return { valid: false, message: error.message };
    }
  };

  const waitForUserProfile = async (userId: string, maxAttempts: number = 10): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[INVITE-FLOW] Verificando perfil do usuário - tentativa ${attempt}/${maxAttempts}`);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, name')
          .eq('id', userId)
          .single();

        if (!error && data) {
          console.log('[INVITE-FLOW] Perfil do usuário encontrado:', data);
          return true;
        }

        if (error && error.code !== 'PGRST116') {
          console.error('[INVITE-FLOW] Erro ao buscar perfil:', error);
        }

        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('[INVITE-FLOW] Erro inesperado ao verificar perfil:', error);
      }
    }

    console.error('[INVITE-FLOW] Perfil do usuário não foi criado após múltiplas tentativas');
    return false;
  };

  const applyInviteToUser = async (token: string, userId: string): Promise<InviteFlowResult> => {
    try {
      console.log('[INVITE-FLOW] Aplicando convite ao usuário:', { userId, token: token.substring(0, 8) + '...' });

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
        logger.info('Convite aplicado com sucesso', {
          component: 'useInviteFlow',
          userId,
          token: token.substring(0, 8) + '...'
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
      console.error('[INVITE-FLOW] Erro inesperado ao aplicar convite:', error);
      return {
        success: false,
        message: 'Erro inesperado: ' + error.message
      };
    }
  };

  const applyInviteToExistingUser = async (token: string, userId: string): Promise<InviteFlowResult> => {
    try {
      console.log('[INVITE-FLOW] Aplicando convite a usuário existente:', { token: token.substring(0, 8) + '...', userId });

      // Verificar se o usuário já tem perfil
      const profileExists = await waitForUserProfile(userId, 3);
      if (!profileExists) {
        return {
          success: false,
          message: 'Perfil do usuário não encontrado. Faça login primeiro.'
        };
      }

      return await applyInviteToUser(token, userId);
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
      console.log('[INVITE-FLOW] Iniciando registro com convite:', { email, name, token: token.substring(0, 8) + '...' });

      // 1. Verificar se usuário já existe
      const userExists = await checkUserExists(email);
      if (userExists) {
        console.log('[INVITE-FLOW] Usuário já existe, precisa fazer login');
        return {
          success: false,
          message: 'Esta conta já existe. Faça login para aplicar o convite.',
          shouldRedirectToLogin: true
        };
      }

      // 2. Validar convite antes de criar a conta
      const inviteValidation = await validateInvite(token, email);
      if (!inviteValidation.valid) {
        return {
          success: false,
          message: inviteValidation.message || 'Convite inválido'
        };
      }

      console.log('[INVITE-FLOW] Convite validado, criando conta:', { email, name });

      // 3. Criar conta nova SEM metadados do convite (para evitar processamento automático)
      const { data: authData, error: signUpError } = await signUp(email, password, {
        name: name.trim(),
        full_name: name.trim()
        // NÃO incluir invite_token aqui para evitar processamento automático
      });

      if (signUpError) {
        console.error('[INVITE-FLOW] Erro no registro:', signUpError);
        
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

      if (!authData?.user?.id) {
        return {
          success: false,
          message: 'Erro: usuário não foi criado corretamente'
        };
      }

      console.log('[INVITE-FLOW] Conta criada, aguardando perfil ser criado...');

      // 4. Aguardar o perfil ser criado pelo trigger
      const profileCreated = await waitForUserProfile(authData.user.id);
      if (!profileCreated) {
        return {
          success: false,
          message: 'Erro: perfil do usuário não foi criado. Tente novamente.'
        };
      }

      console.log('[INVITE-FLOW] Perfil criado, aplicando convite...');

      // 5. Aplicar convite agora que o usuário existe
      const inviteResult = await applyInviteToUser(token, authData.user.id);
      
      if (inviteResult.success) {
        logger.info('Conta criada com sucesso via convite', {
          component: 'useInviteFlow',
          email,
          userId: authData.user.id,
          token: token.substring(0, 8) + '...'
        });
      }

      return inviteResult;

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
    validateInvite,
    applyInviteToExistingUser,
    registerWithInvite
  };
};
