
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

interface UseAuthMethodsProps {
  setIsLoading: (loading: boolean) => void;
}

export const useAuthMethods = ({ setIsLoading }: UseAuthMethodsProps) => {
  const [authError, setAuthError] = useState<string | null>(null);
  
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      logger.info('[AUTH-METHODS] Iniciando login');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      logger.info('[AUTH-METHODS] Login realizado com sucesso');
      return { error: null };

    } catch (error: any) {
      logger.error('[AUTH-METHODS] Erro no login:', error);
      setAuthError(error.message);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });

      if (error) {
        throw error;
      }

      logger.info('[AUTH-METHODS] Cadastro realizado com sucesso');
      return { error: null };

    } catch (error: any) {
      logger.error('[AUTH-METHODS] Erro no cadastro:', error);
      setAuthError(error.message);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      logger.info('[AUTH-METHODS] Iniciando logout SEGURO');
      
      // Logout simples com Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Limpeza básica de localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Redirecionamento para /auth
      window.location.href = '/auth';
      
      return { success: true };

    } catch (error: any) {
      logger.error('[AUTH-METHODS] Erro no logout, forçando saída:', error);
      
      // Limpeza forçada e redirecionamento
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      window.location.href = '/auth';
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Métodos específicos (mantendo compatibilidade)
  const signInAsMember = signIn;
  const signInAsAdmin = signIn;

  return {
    signIn,
    signUp,
    signOut,
    signInAsMember,
    signInAsAdmin,
    authError
  };
};
