
// MIGRAÇÃO TEMPORÁRIA: Redirecionando useAuth para useSimpleAuth
// Este arquivo será usado durante a transição para evitar quebras

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { fetchUserProfile, createUserProfileIfNeeded } from './utils/profileUtils/userProfileFunctions';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContextType } from './types';
import { logger } from '@/utils/logger';

// IMPORTAR O NOVO CONTEXTO
import { useSimpleAuth } from './SimpleAuthProvider';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// PROVIDER LEGACY - mantido para compatibilidade temporária
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usar métodos de auth robustos
  const authMethods = useAuthMethods({ setIsLoading });

  // Função para carregar perfil com retry
  const loadUserProfile = async (userId: string, email?: string, retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      setProfileLoading(true);
      setError(null);
      
      logger.info('Carregando perfil:', { userId, email, attempt: retryCount + 1 });
      
      let userProfile = await fetchUserProfile(userId);
      
      if (!userProfile && email) {
        logger.info('Perfil não encontrado, criando...');
        userProfile = await createUserProfileIfNeeded(userId, email);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        logger.info('Perfil carregado com sucesso');
      } else if (retryCount < maxRetries) {
        const delay = (retryCount + 1) * 1000;
        logger.warn('Tentativa de retry em', { delayMs: delay });
        
        setTimeout(() => {
          loadUserProfile(userId, email, retryCount + 1);
        }, delay);
        return;
      } else {
        throw new Error('Não foi possível carregar o perfil após várias tentativas');
      }
      
    } catch (error) {
      logger.error('Erro ao carregar perfil:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      if (retryCount < maxRetries) {
        const delay = (retryCount + 1) * 2000;
        setTimeout(() => {
          loadUserProfile(userId, email, retryCount + 1);
        }, delay);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    logger.info('Inicializando AuthProvider LEGACY');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state changed:', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user.id, session.user.email);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setError(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logger.error('Erro ao obter sessão:', error);
        setError(error.message);
      } else {
        logger.info('Sessão inicial:', { hasSession: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user.id, session.user.email);
          }, 0);
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id, user.email);
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    isLoading: isLoading || profileLoading,
    error,
    refreshProfile,
    isAdmin: profile?.user_roles?.name === 'admin',
    isFormacao: profile?.user_roles?.name === 'formacao',
    setSession,
    setUser,
    setProfile,
    setIsLoading,
    ...authMethods
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// HOOK PRINCIPAL - MIGRAÇÃO PARA useSimpleAuth
export const useAuth = (): AuthContextType => {
  logger.warn('[MIGRATION] useAuth está sendo redirecionado para useSimpleAuth');
  
  // Usar o novo contexto
  const simpleAuth = useSimpleAuth();
  
  // Adaptar para interface legacy
  return {
    user: simpleAuth.user,
    session: simpleAuth.session,
    profile: simpleAuth.profile,
    isLoading: simpleAuth.isLoading,
    error: simpleAuth.error,
    isAdmin: simpleAuth.isAdmin,
    isFormacao: simpleAuth.isFormacao,
    refreshProfile: async () => {}, // Método vazio para compatibilidade
    setSession: () => {},
    setUser: () => {},
    setProfile: () => {},
    setIsLoading: () => {},
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: simpleAuth.signOut,
    signInAsMember: async () => ({ error: null }),
    signInAsAdmin: async () => ({ error: null }),
    isSigningIn: false
  } as AuthContextType;
};

// Exportar também o novo hook para migração gradual
export { useSimpleAuth } from './SimpleAuthProvider';
