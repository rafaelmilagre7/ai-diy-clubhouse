
import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { AuthContextType } from '@/contexts/auth/types';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase/types';
import { processUserProfile } from '@/hooks/auth/utils/authSessionUtils';
import { validateUserRole as validateUserRoleByEmail } from '@/contexts/auth/utils/profileUtils/roleValidation';
import { TEST_ADMIN, TEST_MEMBER } from '../constants';

interface AuthStateManagerProps {
  children: React.ReactNode;
}

export const AuthStateManager = ({ children }: AuthStateManagerProps): JSX.Element => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isFormacao, setIsFormacao] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Reseta o estado de autenticação
  const resetState = useCallback(() => {
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setIsFormacao(false);
    setIsLoading(false);
    setAuthError(null);
  }, []);

  // Lidar com o login
  const signIn = async (email?: string, password?: string): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = password
        ? await supabase.auth.signInWithPassword({ email: email || '', password })
        : await supabase.auth.signInWithOAuth({ provider: 'google' });

      if (error) {
        console.error('Erro ao fazer login:', error);
        setAuthError(error);
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Erro inesperado ao fazer login:', error);
      setAuthError(new Error(error.message || 'Ocorreu um erro ao tentar fazer login.'));
      return { error: new Error(error.message || 'Ocorreu um erro ao tentar fazer login.') };
    } finally {
      setIsLoading(false);
    }
  };

  // Lidar com o logout
  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erro ao fazer logout:', error);
        setAuthError(error);
      }
    } catch (error: any) {
      console.error('Erro inesperado ao fazer logout:', error);
      setAuthError(new Error(error.message || 'Ocorreu um erro ao tentar fazer logout.'));
    } finally {
      resetState();
      setIsLoading(false);
    }
  };
  
  // Simula o login como membro (para testes)
  const signInAsMember = async (): Promise<void> => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      setUser({ id: 'member-test', app_metadata: {}, user_metadata: {}, aud: '', created_at: '' });
      setIsAdmin(false);
      setIsFormacao(false);
      
      // Simula um perfil de membro
      setProfile({
        id: 'member-test',
        email: TEST_MEMBER,
        name: 'Membro Teste',
        role: 'member',
        created_at: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Erro ao simular login como membro:', error);
      setAuthError(new Error(error.message || 'Ocorreu um erro ao tentar simular o login como membro.'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simula o login como administrador (para testes)
  const signInAsAdmin = async (): Promise<void> => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      setUser({ id: 'admin-test', app_metadata: {}, user_metadata: {}, aud: '', created_at: '' });
      setIsAdmin(true);
      setIsFormacao(false);
      
      // Simula um perfil de administrador
      setProfile({
        id: 'admin-test',
        email: TEST_ADMIN,
        name: 'Admin Teste',
        role: 'admin',
        created_at: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Erro ao simular login como administrador:', error);
      setAuthError(new Error(error.message || 'Ocorreu um erro ao tentar simular o login como administrador.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Processar mudanças na sessão
  const processSessionChange = useCallback(async (session: Session | null) => {
    if (session?.user) {
      try {
        setUser(session.user);

        // Buscar perfil com papéis e permissões
        const profile = await processUserProfile(session.user.id);

        if (profile) {
          setProfile(profile);

          // Se o perfil existe mas não tem role_id, verificar o papel com base no email
          if (!profile.role_id && profile.email) {
            await validateUserRoleByEmail(profile);
          }
        } else {
          console.warn('Perfil do usuário não encontrado após login.');
        }
      } catch (error) {
        console.error('Erro ao processar mudança de sessão:', error);
        setAuthError(new Error('Falha ao carregar dados do usuário.'));
      } finally {
        setIsLoading(false);
      }
    } else {
      resetState();
    }
  }, [setAuthError, setIsLoading, setProfile, setUser, resetState]);

  // Monitorar mudanças na sessão
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      processSessionChange(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      processSessionChange(session);
    });

    return () => subscription.unsubscribe();
  }, [processSessionChange]);

  // Determinar se o usuário é um administrador
  useEffect(() => {
    setIsAdmin(profile?.role === 'admin');
    setIsFormacao(profile?.role === 'formacao');
  }, [profile]);

  const authValue: AuthContextType = {
    session,
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    authError,
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  };

  return (
    <AuthContextType.Provider value={authValue}>
      {children}
    </AuthContextType.Provider>
  );
};
