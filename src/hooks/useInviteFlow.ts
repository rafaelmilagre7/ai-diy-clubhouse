import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

export interface InviteFlowResult {
  success: boolean;
  message?: string;
  shouldRedirectToOnboarding?: boolean;
  redirectPath?: string;
}

export const useInviteFlow = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  // Validar convite
  const validateInvite = async (token: string, email?: string) => {
    try {
      console.log('[INVITE-FLOW] Validando convite:', { token, email });

      if (!email) {
        console.log('[INVITE-FLOW] Validação básica do token');
        const { data: invite, error } = await supabase
          .from('invites')
          .select(`
            id,
            email,
            expires_at,
            used_at,
            user_roles:role_id (
              id,
              name,
              description
            )
          `)
          .eq('token', token)
          .single();

        if (error) {
          console.error('[INVITE-FLOW] Erro ao validar convite:', error);
          return { valid: false, message: 'Convite não encontrado' };
        }

        if (invite.used_at) {
          return { valid: false, message: 'Este convite já foi utilizado' };
        }

        if (new Date(invite.expires_at) < new Date()) {
          return { valid: false, message: 'Este convite expirou' };
        }

        return { 
          valid: true, 
          invite,
          message: 'Convite válido' 
        };
      }

      // Validação com email usando função do banco
      const { data, error } = await supabase.rpc('can_use_invite', {
        invite_token: token,
        user_email: email
      });

      if (error) {
        console.error('[INVITE-FLOW] Erro ao validar convite com email:', error);
        return { valid: false, message: 'Erro ao validar convite' };
      }

      return data;
    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro inesperado na validação:', error);
      return { valid: false, message: 'Erro inesperado ao validar convite' };
    }
  };

  // Processar registro com convite - MELHORADO
  const processInviteRegistration = async (
    token: string, 
    email: string, 
    password: string, 
    name?: string
  ): Promise<InviteFlowResult> => {
    try {
      setIsProcessing(true);

      console.log('[INVITE-FLOW] Iniciando registro com convite:', { token, email, name });

      // Primeiro validar o convite
      const validation = await validateInvite(token, email);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message || 'Convite inválido'
        };
      }

      // Registrar usuário
      const { error: signUpError } = await signUp(email, password, {
        name: name || undefined,
        invite_token: token
      });

      if (signUpError) {
        console.error('[INVITE-FLOW] Erro no registro:', signUpError);
        
        // Melhor tratamento de erros específicos
        let errorMessage = 'Erro no registro';
        
        if (signUpError.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Use a opção "Já tem uma conta?" abaixo.';
        } else if (signUpError.message.includes('Password')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres';
        } else if (signUpError.message.includes('Email')) {
          errorMessage = 'Email inválido';
        } else {
          errorMessage = `Erro no registro: ${signUpError.message}`;
        }
        
        return {
          success: false,
          message: errorMessage
        };
      }

      // Aguardar um pouco para garantir que o usuário foi criado
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          message: 'Conta criada, mas erro ao fazer login automático. Tente fazer login manualmente.'
        };
      }

      // Aplicar o convite
      const { data: applyResult, error: applyError } = await supabase.rpc('use_invite', {
        invite_token: token,
        user_id: user.id
      });

      if (applyError) {
        console.error('[INVITE-FLOW] Erro ao aplicar convite:', applyError);
        return {
          success: false,
          message: 'Conta criada com sucesso, mas erro ao aplicar convite. Contate o suporte.'
        };
      }

      const result = typeof applyResult === 'string' ? JSON.parse(applyResult) : applyResult;

      if (result.status !== 'success') {
        console.error('[INVITE-FLOW] Falha ao aplicar convite:', result);
        return {
          success: false,
          message: result.message || 'Erro ao aplicar convite'
        };
      }

      console.log('[INVITE-FLOW] Convite aplicado com sucesso');
      
      return {
        success: true,
        message: 'Conta criada e convite aplicado com sucesso!',
        shouldRedirectToOnboarding: true,
        redirectPath: '/onboarding'
      };

    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro inesperado:', error);
      return {
        success: false,
        message: 'Erro inesperado durante o processo'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // Processar convite para usuário existente - MELHORADO
  const processInviteForExistingUser = async (token: string): Promise<InviteFlowResult> => {
    try {
      setIsProcessing(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          message: 'Usuário não autenticado'
        };
      }

      console.log('[INVITE-FLOW] Aplicando convite para usuário existente:', {
        token,
        userId: user.id,
        userEmail: user.email
      });

      // Aplicar o convite
      const { data: applyResult, error: applyError } = await supabase.rpc('use_invite', {
        invite_token: token,
        user_id: user.id
      });

      if (applyError) {
        console.error('[INVITE-FLOW] Erro ao aplicar convite:', applyError);
        
        let errorMessage = 'Erro ao aplicar convite';
        
        if (applyError.message.includes('already used')) {
          errorMessage = 'Este convite já foi utilizado';
        } else if (applyError.message.includes('expired')) {
          errorMessage = 'Este convite expirou';
        } else if (applyError.message.includes('not found')) {
          errorMessage = 'Convite não encontrado';
        }
        
        return {
          success: false,
          message: errorMessage
        };
      }

      const result = typeof applyResult === 'string' ? JSON.parse(applyResult) : applyResult;

      if (result.status !== 'success') {
        return {
          success: false,
          message: result.message || 'Erro ao aplicar convite'
        };
      }

      return {
        success: true,
        message: 'Convite aplicado com sucesso!',
        shouldRedirectToOnboarding: true,
        redirectPath: '/onboarding'
      };

    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro inesperado:', error);
      return {
        success: false,
        message: 'Erro inesperado ao aplicar convite'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // Aliases para compatibilidade
  const registerWithInvite = processInviteRegistration;
  const applyInviteToExistingUser = processInviteForExistingUser;

  return {
    validateInvite,
    processInviteRegistration,
    processInviteForExistingUser,
    registerWithInvite,
    applyInviteToExistingUser,
    isProcessing
  };
};
