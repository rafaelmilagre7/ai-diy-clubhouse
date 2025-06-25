
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

  const signUp = async (
    email: string, 
    password: string, 
    options: SignUpOptions = {}
  ) => {
    try {
      setIsLoading(true);
      console.log('[AUTH-METHODS] Iniciando signup:', {
        email: email.toLowerCase(),
        hasInviteToken: !!options.inviteToken,
        userName: options.userData?.name
      });

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

      if (options.inviteToken) {
        console.log('[AUTH-METHODS] Processando convite');
        
        if (options.inviteToken.length < 10) {
          const tokenError = new Error('Token de convite inválido');
          console.error('[AUTH-METHODS] Token inválido');
          toast.error('Token de convite inválido');
          return { error: tokenError };
        }
        
        const { data: inviteResult, error: inviteError } = await supabase.rpc(
          'complete_invite_registration',
          {
            p_token: options.inviteToken,
            p_user_id: data.user.id
          }
        );

        if (inviteError || !inviteResult?.success) {
          const errorMessage = inviteError?.message || inviteResult?.message || 'Erro ao processar convite';
          console.error('[AUTH-METHODS] Erro no convite:', errorMessage);
          toast.error('Erro ao processar convite: ' + errorMessage);
          
          InviteTokenManager.clearTokenOnError();
          return { error: new Error(errorMessage) };
        }

        console.log('[AUTH-METHODS] Convite processado com sucesso');
        toast.success('Conta criada e convite aceito com sucesso!');
        
        InviteTokenManager.clearTokenOnSuccess();
      } else {
        toast.success('Conta criada com sucesso!');
      }

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      console.error('[AUTH-METHODS] Erro inesperado no signup:', error);
      toast.error('Erro inesperado: ' + error.message);
      
      if (options.inviteToken) {
        InviteTokenManager.clearTokenOnError();
      }
      
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // CORREÇÃO CRÍTICA: Logout com limpeza completa e robust
  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log('[AUTH-METHODS] Iniciando logout completo');
      
      // FASE 1: Limpeza completa de tokens de convite
      InviteTokenManager.clearTokenOnLogout();
      
      // FASE 2: Limpeza completa do localStorage
      try {
        const keysToRemove: string[] = [];
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('viver-ia')) {
            keysToRemove.push(key);
          }
        });
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log('[AUTH-METHODS] Removida chave:', key);
        });
      } catch (storageError) {
        console.warn('[AUTH-METHODS] Erro na limpeza do storage:', storageError);
      }
      
      // FASE 3: SignOut do Supabase com fallback
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('[AUTH-METHODS] SignOut Supabase realizado');
      } catch (signOutError) {
        console.warn('[AUTH-METHODS] Erro no signOut Supabase, continuando:', signOutError);
        // Continuar mesmo se o signOut falhar
      }
      
      // FASE 4: Feedback e redirect forçado
      toast.success('Logout realizado com sucesso!');
      console.log('[AUTH-METHODS] Logout completo, redirecionando');
      
      // Aguardar 100ms para garantir que o toast seja exibido
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
      return { success: true, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      console.error('[AUTH-METHODS] Erro no logout:', error);
      
      // Mesmo com erro, forçar limpeza e redirect
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      } catch {}
      
      setTimeout(() => {
        window.location.href = '/auth';
      }, 500);
      
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
