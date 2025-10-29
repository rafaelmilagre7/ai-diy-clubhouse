
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthMethodsParams {
  setIsLoading: (loading: boolean) => void;
}

export const useAuthMethods = ({ setIsLoading }: AuthMethodsParams) => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setIsSigningIn(true);
      
      // Verificar se há sessão ativa antes do login
      const { data: currentSession } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ [AUTH] Erro no login:', {
          message: error.message,
          status: error.status,
          name: error.name,
          code: error.code
        });
        // Toast será tratado pelo componente que chamou esta função
        return { error };
      }

      if (data.user) {
        // Buscar e atualizar role do usuário no metadata
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select(`
              role_id,
              user_roles:role_id (
                name
              )
            `)
            .eq('id', data.user.id)
            .single();

          if (profile?.user_roles) {
            let roleName: string | null = null;
            
            if (Array.isArray(profile.user_roles)) {
              roleName = profile.user_roles[0]?.name || null;
            } else if (profile.user_roles && typeof profile.user_roles === 'object' && 'name' in profile.user_roles) {
              roleName = (profile.user_roles as { name: string }).name;
            }

            if (roleName) {
              await supabase.auth.updateUser({
                data: { role: roleName }
              });
            }
          }
        } catch (metadataError) {
          // Falha silenciosa
        }

        // Toast de sucesso será mostrado pelo componente (AuthLayout ou SecureLoginForm)
      }

      return { error: null };
    } catch (err) {
      console.error('❌ [AUTH] Erro inesperado no login:', err);
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      // Toast será tratado pelo componente que chamou esta função
      return { error };
    } finally {
      setIsSigningIn(false);
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ [AUTH] Erro no logout:', error);
        // Toast será tratado pelo componente que chamou esta função
        throw error;
      }

      // Toast de sucesso será mostrado pelo componente que chamou o logout
    } catch (err) {
      console.error('❌ [AUTH] Erro inesperado no logout:', err);
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  return {
    signIn,
    signOut,
    isSigningIn
  };
};
