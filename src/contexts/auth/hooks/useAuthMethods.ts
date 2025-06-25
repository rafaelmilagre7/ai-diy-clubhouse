
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { cleanupAuthState } from '@/utils/authCleanup';

interface UseAuthMethodsProps {
  setIsLoading: (loading: boolean) => void;
}

export const useAuthMethods = ({ setIsLoading }: UseAuthMethodsProps) => {
  const [authError, setAuthError] = useState<string | null>(null);
  
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      // CORREÇÃO: Limpeza prévia antes do login
      try {
        await cleanupAuthState();
      } catch (error) {
        logger.warn('Erro na limpeza prévia, continuando:', error);
      }
      
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
      logger.info('[AUTH-METHODS] Iniciando logout');
      
      // CORREÇÃO: Limpeza completa durante logout
      await cleanupAuthState();
      
      logger.info('[AUTH-METHODS] Logout realizado com sucesso');
      
      // CORREÇÃO: Forçar redirecionamento para auth
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
      return { success: true };

    } catch (error: any) {
      logger.error('[AUTH-METHODS] Erro no logout:', error);
      
      // CORREÇÃO: Mesmo com erro, forçar limpeza e redirecionamento
      try {
        await cleanupAuthState();
      } catch (cleanupError) {
        logger.warn('Erro na limpeza de emergência:', cleanupError);
      }
      
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
