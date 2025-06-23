
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { logger } from '@/utils/logger';

interface AuthMethodsParams {
  setIsLoading: (loading: boolean) => void;
}

interface SignUpOptions {
  inviteToken?: string;
  userData?: {
    name?: string;
  };
}

export const useAuthMethods = ({ setIsLoading }: AuthMethodsParams) => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setIsSigningIn(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('Erro no login:', error, { component: 'AUTH_METHODS' });
        toast.error('Erro no login: ' + error.message);
        return { error };
      }

      if (data.user) {
        logger.info('Login realizado:', { email: data.user.email, component: 'AUTH_METHODS' });
        toast.success('Login realizado com sucesso!');
      }

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      logger.error('Erro inesperado no login:', error, { component: 'AUTH_METHODS' });
      toast.error('Erro inesperado: ' + error.message);
      return { error };
    } finally {
      setIsSigningIn(false);
      setIsLoading(false);
    }
  };

  // SignUp ROBUSTO com melhor tratamento de erros
  const signUp = async (
    email: string, 
    password: string, 
    options: SignUpOptions = {}
  ) => {
    try {
      setIsLoading(true);
      logger.info('Iniciando signup:', {
        email: email.toLowerCase(),
        hasInviteToken: !!options.inviteToken,
        userName: options.userData?.name,
        component: 'AUTH_METHODS'
      });

      // Signup básico primeiro
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            name: options.userData?.name || '',
            invite_token: options.inviteToken || ''
          }
        }
      });

      if (error) {
        logger.error('Erro no signup básico:', error, { 
          component: 'AUTH_METHODS',
          email: email.toLowerCase() 
        });
        
        // Melhor tratamento de mensagens de erro
        let errorMessage = 'Erro no cadastro';
        if (error.message.includes('already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login.';
        } else if (error.message.includes('password')) {
          errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
        } else if (error.message.includes('email')) {
          errorMessage = 'Email inválido.';
        } else {
          errorMessage = `Erro no cadastro: ${error.message}`;
        }
        
        toast.error(errorMessage);
        return { error: new Error(errorMessage) };
      }

      if (!data.user) {
        const signupError = new Error('Falha ao criar usuário');
        logger.error('Usuário não criado no signup:', signupError, { component: 'AUTH_METHODS' });
        toast.error('Falha ao criar usuário');
        return { error: signupError };
      }

      logger.info('Usuário criado com sucesso:', { 
        userId: data.user.id,
        email: data.user.email,
        component: 'AUTH_METHODS' 
      });

      // PROCESSAR CONVITE de forma mais robusta
      if (options.inviteToken) {
        logger.info('Processando convite após signup:', { 
          token: options.inviteToken.substring(0, 8) + '...',
          userId: data.user.id,
          component: 'AUTH_METHODS' 
        });
        
        try {
          // Validação adicional do token
          if (options.inviteToken.length < 10) {
            throw new Error('Token de convite inválido');
          }
          
          const { data: inviteResult, error: inviteError } = await supabase.rpc(
            'complete_invite_registration',
            {
              p_token: options.inviteToken,
              p_user_id: data.user.id
            }
          );

          if (inviteError) {
            logger.error('Erro na função RPC de convite:', inviteError, { 
              component: 'AUTH_METHODS',
              token: options.inviteToken.substring(0, 8) + '...'
            });
            throw new Error(inviteError.message);
          }

          if (!inviteResult?.success) {
            const errorMessage = inviteResult?.message || 'Erro ao processar convite';
            logger.error('Convite não processado:', new Error(errorMessage), { 
              component: 'AUTH_METHODS',
              result: inviteResult
            });
            throw new Error(errorMessage);
          }

          // Sucesso no convite
          logger.info('Convite processado com sucesso:', { 
            userId: data.user.id,
            component: 'AUTH_METHODS' 
          });
          toast.success('Conta criada e convite aceito com sucesso!');
          
          InviteTokenManager.clearTokenOnSuccess();
        } catch (inviteError: any) {
          // Log do erro do convite mas não falha todo o processo
          logger.error('Erro ao processar convite (usuário já criado):', inviteError, { 
            component: 'AUTH_METHODS',
            userId: data.user.id
          });
          
          // Mostrar erro específico mas não falhar o signup
          toast.error('Conta criada, mas erro ao processar convite: ' + inviteError.message);
          InviteTokenManager.clearTokenOnError();
          
          // Retornar sucesso parcial - usuário foi criado
          return { error: null, partialSuccess: true };
        }
      } else {
        toast.success('Conta criada com sucesso!');
      }

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      logger.error('Erro inesperado no signup:', error, { component: 'AUTH_METHODS' });
      toast.error('Erro inesperado: ' + error.message);
      
      if (options.inviteToken) {
        InviteTokenManager.clearTokenOnError();
      }
      
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      InviteTokenManager.clearTokenOnLogout();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Erro no logout:', error, { component: 'AUTH_METHODS' });
        toast.error('Erro ao fazer logout: ' + error.message);
        return { success: false, error };
      }

      logger.info('Logout realizado com sucesso', { component: 'AUTH_METHODS' });
      toast.success('Logout realizado com sucesso!');
      return { success: true, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      logger.error('Erro inesperado no logout:', error, { component: 'AUTH_METHODS' });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsMember = async (email: string, password: string) => {
    return await signIn(email, password);
  };

  const signInAsAdmin = async (email: string, password: string) => {
    return await signIn(email, password);
  };

  return {
    signIn,
    signUp,
    signOut,
    signInAsMember,
    signInAsAdmin,
    isSigningIn
  };
};
