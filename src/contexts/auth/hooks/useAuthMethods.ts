
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
      
      console.log('🔄 [AUTH] Iniciando login:', email);
      console.log('🔍 [AUTH] Estado localStorage antes do login:', {
        supabaseAuthKeys: Object.keys(localStorage).filter(key => 
          key.startsWith('supabase.auth.') || key.includes('sb-')
        ).length,
        allKeys: Object.keys(localStorage).length
      });
      
      // Verificar se há sessão ativa antes do login
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('🔍 [AUTH] Sessão atual antes do login:', {
        hasSession: !!currentSession.session,
        hasUser: !!currentSession.session?.user
      });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ [AUTH] Erro no login:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        toast.error('Erro no login', {
          description: error.message
        });
        return { error };
      }

      if (data.user) {
        console.log('✅ [AUTH] Login realizado com sucesso:', {
          email: data.user.email,
          userId: data.user.id,
          hasSession: !!data.session
        });
        
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
          console.warn('⚠️ [AUTH] Erro ao atualizar metadata:', metadataError);
        }

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
  }, [setIsLoading]);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ [AUTH] Erro no logout:', error);
        toast.error('Erro ao fazer logout', {
          description: error.message
        });
        throw error;
      }

      toast.success('Logout realizado com sucesso!');
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
