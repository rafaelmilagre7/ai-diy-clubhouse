
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

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
        console.error('Erro no login:', error);
        toast.error('Erro no login: ' + error.message);
        return { error };
      }

      if (data.user) {
        console.log('Login realizado:', data.user.email);
        toast.success('Login realizado com sucesso!');
      }

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      toast.error('Erro inesperado: ' + error.message);
      return { error };
    } finally {
      setIsSigningIn(false);
      setIsLoading(false);
    }
  };

  // SignUp SIMPLIFICADO - validação direta
  const signUp = async (
    email: string, 
    password: string, 
    options: SignUpOptions = {}
  ) => {
    try {
      setIsLoading(true);
      console.log('[AUTH-METHODS] Iniciando signup:', {
        email,
        hasInviteToken: !!options.inviteToken,
        userName: options.userData?.name
      });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: options.userData?.name || '',
            invite_token: options.inviteToken || ''
          }
        }
      });

      if (error) {
        console.error('[AUTH-METHODS] Erro no signup:', error);
        toast.error('Erro no cadastro: ' + error.message);
        return { error };
      }

      if (!data.user) {
        const signupError = new Error('Falha ao criar usuário');
        toast.error('Falha ao criar usuário');
        return { error: signupError };
      }

      console.log('[AUTH-METHODS] Usuário criado:', data.user.email);

      // PROCESSAR CONVITE - validação direta sem try/catch aninhado
      if (options.inviteToken) {
        console.log('[AUTH-METHODS] Processando convite');
        
        const { data: inviteResult, error: inviteError } = await supabase.rpc(
          'complete_invite_registration',
          {
            p_token: options.inviteToken,
            p_user_id: data.user.id
          }
        );

        if (inviteError || !inviteResult?.success) {
          // Erro no convite = falha clara
          const errorMessage = inviteError?.message || inviteResult?.message || 'Erro ao processar convite';
          console.error('[AUTH-METHODS] Erro no convite:', errorMessage);
          toast.error('Erro ao processar convite: ' + errorMessage);
          return { error: new Error(errorMessage) };
        }

        // Sucesso no convite
        console.log('[AUTH-METHODS] Convite processado com sucesso');
        toast.success('Conta criada e convite aceito com sucesso!');
        InviteTokenManager.clearToken();
      } else {
        toast.success('Conta criada com sucesso!');
      }

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      console.error('[AUTH-METHODS] Erro inesperado no signup:', error);
      toast.error('Erro inesperado: ' + error.message);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
        toast.error('Erro ao fazer logout: ' + error.message);
        return { success: false, error };
      }

      console.log('Logout realizado');
      toast.success('Logout realizado com sucesso!');
      return { success: true, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
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
