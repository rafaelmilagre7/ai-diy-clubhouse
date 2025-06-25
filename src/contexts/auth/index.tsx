
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
  const [error, setError] = useState<string | null>(null);

  // Usar métodos de auth
  const authMethods = useAuthMethods({ setIsLoading });

  // CORREÇÃO: Função simplificada para carregar perfil (1 tentativa apenas)
  const loadUserProfile = async (userId: string, email?: string) => {
    try {
      setError(null);
      
      logger.info('[AUTH] Carregando perfil:', { userId: userId.substring(0, 8) + '***' });
      
      let userProfile = await fetchUserProfile(userId);
      
      // Se não encontrou perfil, tentar criar uma única vez
      if (!userProfile && email) {
        logger.info('[AUTH] Criando perfil...');
        userProfile = await createUserProfileIfNeeded(userId, email);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        logger.info('[AUTH] Perfil carregado com sucesso');
      } else {
        logger.warn('[AUTH] Perfil não encontrado, continuando sem perfil');
      }
      
    } catch (error) {
      logger.error('[AUTH] Erro ao carregar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar perfil';
      setError(errorMessage);
    }
  };

  // CORREÇÃO: Auth state listener simplificado
  useEffect(() => {
    logger.info('[AUTH] Inicializando AuthProvider');
    
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        logger.info('[AUTH] Auth state changed:', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // CORREÇÃO: Delay mínimo para evitar deadlock
          setTimeout(() => {
            if (mounted) {
              loadUserProfile(session.user.id, session.user.email);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setError(null);
        }
      }
    );

    // CORREÇÃO: Verificar sessão inicial com timeout rigoroso
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          logger.error('[AUTH] Erro ao obter sessão:', error);
          setError(error.message);
          return;
        }
        
        logger.info('[AUTH] Sessão inicial verificada:', { hasSession: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            if (mounted) {
              loadUserProfile(session.user.id, session.user.email);
            }
          }, 200);
        }
        
      } catch (error) {
        logger.error('[AUTH] Erro inesperado:', error);
        if (mounted) {
          setError('Erro ao verificar autenticação');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // CORREÇÃO: Timeout de inicialização de 2s (mais agressivo)
    initTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        logger.warn('[AUTH] Timeout de inicialização, continuando');
        setIsLoading(false);
      }
    }, 2000);

    checkInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
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
    isLoading,
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
