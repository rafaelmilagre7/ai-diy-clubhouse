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
        
        // CORREÇÃO CRÍTICA: Buscar role do usuário e atualizar metadata imediatamente
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
            // Correção de tipagem: garantir que user_roles seja tratado corretamente
            let roleName: string | null = null;
            
            if (Array.isArray(profile.user_roles)) {
              roleName = profile.user_roles[0]?.name || null;
            } else if (profile.user_roles && typeof profile.user_roles === 'object' && 'name' in profile.user_roles) {
              roleName = (profile.user_roles as { name: string }).name;
            }

            if (roleName) {
              console.log(`🔄 [AUTH] Atualizando user_metadata no login: role=${roleName}`);
              await supabase.auth.updateUser({
                data: { role: roleName }
              });
              console.log(`✅ [AUTH] User_metadata atualizado no login: role=${roleName}`);
            }
          }
        } catch (metadataError) {
          console.warn('⚠️ [AUTH] Erro ao atualizar metadata no login:', metadataError);
          // Não bloquear o login por erro de metadata
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
