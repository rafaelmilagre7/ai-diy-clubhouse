
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

interface InviteFlowResult {
  success: boolean;
  error?: string;
  needsLogin?: boolean;
  needsOnboarding?: boolean;
}

export const useInviteFlow = () => {
  const { user, signUp, signIn } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const validateInvite = useCallback(async (token: string, email?: string) => {
    try {
      console.log('[INVITE-FLOW] Validando convite:', { token, email });
      
      if (!email) {
        return { valid: false, message: 'Email é obrigatório para validação' };
      }

      const { data, error } = await supabase.rpc('can_use_invite', {
        invite_token: token,
        user_email: email
      });

      if (error) {
        console.error('[INVITE-FLOW] Erro na validação:', error);
        return { valid: false, message: 'Erro ao validar convite' };
      }

      console.log('[INVITE-FLOW] Resultado da validação:', data);
      return data;
    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro inesperado na validação:', error);
      return { valid: false, message: 'Erro inesperado na validação' };
    }
  }, []);

  const applyInviteToUser = useCallback(async (token: string, userId: string) => {
    try {
      console.log('[INVITE-FLOW] Aplicando convite ao usuário:', { token, userId });
      
      const { data, error } = await supabase.rpc('use_invite', {
        invite_token: token,
        user_id: userId
      });

      if (error) {
        console.error('[INVITE-FLOW] Erro ao aplicar convite:', error);
        return { success: false, error: error.message };
      }

      console.log('[INVITE-FLOW] Convite aplicado com sucesso:', data);
      
      // Verificar se o resultado é um objeto JSON válido
      if (typeof data === 'object' && data !== null) {
        return {
          success: data.status === 'success',
          error: data.status !== 'success' ? data.message : undefined
        };
      }
      
      // Se data não é um objeto, tentar parsear como JSON
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          return {
            success: parsed.status === 'success',
            error: parsed.status !== 'success' ? parsed.message : undefined
          };
        } catch (parseError) {
          console.error('[INVITE-FLOW] Erro ao parsear resposta:', parseError);
          return { success: false, error: 'Resposta inválida do servidor' };
        }
      }

      return { success: false, error: 'Resposta inesperada do servidor' };
    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro inesperado ao aplicar convite:', error);
      return { success: false, error: 'Erro inesperado ao aplicar convite' };
    }
  }, []);

  const waitForProfile = useCallback(async (userId: string, maxAttempts = 10) => {
    console.log('[INVITE-FLOW] Aguardando criação do perfil para:', userId);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, email, role_id')
          .eq('id', userId)
          .single();

        if (!error && profile) {
          console.log('[INVITE-FLOW] Perfil encontrado na tentativa', attempt, ':', profile);
          return { success: true, profile };
        }

        console.log('[INVITE-FLOW] Perfil não encontrado na tentativa', attempt, 'aguardando...');
        
        // Aguardar antes da próxima tentativa (progressivamente mais tempo)
        await new Promise(resolve => setTimeout(resolve, attempt * 500));
        
      } catch (error: any) {
        console.error('[INVITE-FLOW] Erro ao verificar perfil na tentativa', attempt, ':', error);
      }
    }

    return { success: false, error: 'Perfil não foi criado dentro do tempo esperado' };
  }, []);

  const processInviteRegistration = useCallback(async (
    token: string,
    email: string,
    password: string,
    name?: string
  ): Promise<InviteFlowResult> => {
    setIsProcessing(true);
    
    try {
      console.log('[INVITE-FLOW] Iniciando processo de registro com convite');
      
      // 1. Validar convite primeiro
      const validation = await validateInvite(token, email);
      if (!validation.valid) {
        return { success: false, error: validation.message };
      }

      // 2. Criar conta
      console.log('[INVITE-FLOW] Criando conta do usuário');
      const { error: signUpError } = await signUp(email, password, {
        name,
        invite_token: token
      });

      if (signUpError) {
        console.error('[INVITE-FLOW] Erro no registro:', signUpError);
        return { success: false, error: signUpError.message };
      }

      // 3. Fazer login para obter o usuário autenticado
      console.log('[INVITE-FLOW] Fazendo login após registro');
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        console.error('[INVITE-FLOW] Erro no login após registro:', signInError);
        return { success: false, error: 'Conta criada, mas erro no login. Tente fazer login manualmente.' };
      }

      // 4. Aguardar a criação do perfil
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 5. Obter sessão atual para pegar o user ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'Usuário não autenticado após login' };
      }

      // 6. Aguardar perfil ser criado
      const profileResult = await waitForProfile(session.user.id);
      if (!profileResult.success) {
        return { success: false, error: profileResult.error };
      }

      // 7. Aplicar convite ao usuário
      console.log('[INVITE-FLOW] Aplicando convite ao usuário autenticado');
      const applyResult = await applyInviteToUser(token, session.user.id);
      
      if (!applyResult.success) {
        return { success: false, error: applyResult.error };
      }

      console.log('[INVITE-FLOW] Processo completo de registro com convite finalizado com sucesso');
      
      logger.info('Convite processado com sucesso', {
        component: 'useInviteFlow',
        userId: session.user.id,
        email
      });

      return { 
        success: true, 
        needsOnboarding: true
      };

    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro inesperado no processo:', error);
      logger.error('Erro no processo de convite', error, {
        component: 'useInviteFlow'
      });
      return { success: false, error: 'Erro inesperado durante o processo' };
    } finally {
      setIsProcessing(false);
    }
  }, [validateInvite, signUp, signIn, applyInviteToUser, waitForProfile]);

  const processInviteForExistingUser = useCallback(async (token: string): Promise<InviteFlowResult> => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado', needsLogin: true };
    }

    setIsProcessing(true);
    
    try {
      console.log('[INVITE-FLOW] Processando convite para usuário existente:', user.id);
      
      // Aplicar convite diretamente
      const result = await applyInviteToUser(token, user.id);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      console.log('[INVITE-FLOW] Convite aplicado para usuário existente com sucesso');
      
      return { 
        success: true,
        needsOnboarding: false // Usuário existente não precisa de onboarding
      };

    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro ao processar convite para usuário existente:', error);
      return { success: false, error: 'Erro inesperado ao processar convite' };
    } finally {
      setIsProcessing(false);
    }
  }, [user, applyInviteToUser]);

  return {
    validateInvite,
    processInviteRegistration,
    processInviteForExistingUser,
    isProcessing
  };
};
