
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { fetchUserProfile, createUserProfileIfNeeded } from './utils/profileUtils/userProfileFunctions';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContextType } from './types';
import { logger } from '@/utils/logger';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      
      logger.info('[AUTH-PROVIDER] Carregando perfil:', { userId, email, attempt: retryCount + 1 });
      
      let userProfile = await fetchUserProfile(userId);
      
      // Se não encontrou perfil, tentar criar
      if (!userProfile && email) {
        logger.info('[AUTH-PROVIDER] Perfil não encontrado, criando...');
        userProfile = await createUserProfileIfNeeded(userId, email);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        logger.info('[AUTH-PROVIDER] Perfil carregado com sucesso');
      } else if (retryCount < maxRetries) {
        // Retry com delay progressivo
        const delay = (retryCount + 1) * 1000;
        logger.warn('[AUTH-PROVIDER] Tentativa de retry em', delay, 'ms');
        
        setTimeout(() => {
          loadUserProfile(userId, email, retryCount + 1);
        }, delay);
        return;
      } else {
        throw new Error('Não foi possível carregar o perfil após várias tentativas');
      }
      
    } catch (error) {
      logger.error('[AUTH-PROVIDER] Erro ao carregar perfil:', error);
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

  // Configurar listener de mudanças de auth
  useEffect(() => {
    logger.info('[AUTH-PROVIDER] Inicializando AuthProvider');
    
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('[AUTH-PROVIDER] Auth state changed:', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Usar setTimeout para evitar deadlocks
          setTimeout(() => {
            loadUserProfile(session.user.id, session.user.email);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setError(null);
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logger.error('[AUTH-PROVIDER] Erro ao obter sessão:', error);
        setError(error.message);
      } else {
        logger.info('[AUTH-PROVIDER] Sessão inicial:', { hasSession: !!session });
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

  // Função de refresh manual
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
    ...authMethods
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
