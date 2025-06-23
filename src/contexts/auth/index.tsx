
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile, validateUserRole, isSuperAdmin } from './utils';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContextType, UserProfile } from './types';
import { auditLogger } from '@/utils/auditLogger';
import { logger } from '@/utils/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  
  const authMethods = useAuthMethods();

  // Função de sign in
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error: any) {
      logger.error('Erro no sign in', {
        component: 'AuthProvider',
        error: error.message
      });
      setAuthError(error);
      return { user: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Função de sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthError(null);
    } catch (error: any) {
      logger.error('Erro no sign out', {
        component: 'AuthProvider',
        error: error.message
      });
      setAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de teste (mantidas para compatibilidade)
  const signInAsMember = () => signIn('member@test.com', 'password123');
  const signInAsAdmin = () => signIn('admin@test.com', 'password123');

  // Função para definir loading state
  const setAuthLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  // Gerenciar mudanças de estado de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state changed', {
          component: 'AuthProvider',
          event,
          hasSession: !!session
        });

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Buscar perfil do usuário
          setTimeout(async () => {
            try {
              const userProfile = await fetchUserProfile(session.user.id);
              setProfile(userProfile);
            } catch (error) {
              logger.error('Erro ao buscar perfil do usuário', {
                component: 'AuthProvider',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
              });
            }
          }, 0);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Calcular propriedades derivadas
  const isAdmin = profile ? validateUserRole(profile, ['admin', 'super_admin']) : false;
  const isFormacao = profile ? validateUserRole(profile, ['formacao']) : false;

  const value: AuthContextType = {
    user,
    session,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    authError,
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    registerWithInvite: authMethods.registerWithInvite,
    setIsLoading: setAuthLoading,
    setProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
