
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthMethodsParams {
  setIsLoading: (loading: boolean) => void;
}

export const useAuthMethods = ({ setIsLoading }: AuthMethodsParams) => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setIsSigningIn(true);
      
      console.log('🔄 [AUTH] Iniciando login:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ [AUTH] Erro no login:', error);
        toast.error('Erro no login', {
          description: error.message
        });
        return { error };
      }

      if (data.user) {
        console.log('✅ [AUTH] Login realizado com sucesso:', data.user.email);
        toast.success('Login realizado com sucesso!');
      }

      return { error: null };
    } catch (err) {
      console.error('❌ [AUTH] Erro inesperado no login:', err);
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      toast.error('Erro inesperado', {
        description: error.message
      });
      return { error };
    } finally {
      setIsSigningIn(false);
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 [AUTH] Iniciando logout');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ [AUTH] Erro no logout:', error);
        toast.error('Erro ao fazer logout', {
          description: error.message
        });
        return { success: false, error };
      }

      console.log('✅ [AUTH] Logout realizado com sucesso');
      toast.success('Logout realizado com sucesso!');
      return { success: true, error: null };
    } catch (err) {
      console.error('❌ [AUTH] Erro inesperado no logout:', err);
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Métodos específicos para diferentes tipos de usuário
  const signInAsMember = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (!result.error) {
      console.log('👤 [AUTH] Login como membro realizado');
    }
    return result;
  };

  const signInAsAdmin = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (!result.error) {
      console.log('🔑 [AUTH] Login como admin realizado');
    }
    return result;
  };

  return {
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    isSigningIn
  };
};
