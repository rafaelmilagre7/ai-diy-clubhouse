
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { forceAuthRedirect, recoverFromAuthError } from '@/utils/authCleanup';

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
      
      // CORREÇÃO: Usar o método de logout mais seguro
      await recoverFromAuthError();
      
      return { success: true };

    } catch (error: any) {
      logger.error('[AUTH-METHODS] Erro no logout, forçando saída:', error);
      
      // CORREÇÃO: Mesmo com erro, forçar saída completa
      try {
        await forceAuthRedirect();
      } catch (forceError) {
        logger.error('Erro ao forçar saída:', forceError);
        // Último recurso - reload da página
        window.location.reload();
      }
      
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
