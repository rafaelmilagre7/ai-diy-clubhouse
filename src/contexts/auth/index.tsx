
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

  // CORREÇÃO: Função para carregar perfil com limite rigoroso de retry
  const loadUserProfile = async (userId: string, email?: string, retryCount = 0) => {
    const maxRetries = 2; // REDUZIDO de 3 para 2
    
    try {
      setProfileLoading(true);
      setError(null);
      
      logger.info('Carregando perfil:', { userId, email, attempt: retryCount + 1 });
      
      let userProfile = await fetchUserProfile(userId);
      
      // Se não encontrou perfil, tentar criar (apenas na primeira tentativa)
      if (!userProfile && email && retryCount === 0) {
        logger.info('Perfil não encontrado, criando...');
        userProfile = await createUserProfileIfNeeded(userId, email);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        logger.info('Perfil carregado com sucesso');
        return;
      } 
      
      // CORREÇÃO: Retry com limite mais rigoroso
      if (retryCount < maxRetries) {
        const delay = 1000; // FIXO em 1s ao invés de progressivo
        logger.warn('Tentativa de retry em', { delayMs: delay });
        
        setTimeout(() => {
          loadUserProfile(userId, email, retryCount + 1);
        }, delay);
        return;
      } 
      
      // Se esgotou tentativas, falhar graciosamente
      logger.warn('Máximo de tentativas atingido, continuando sem perfil');
      setError('Não foi possível carregar o perfil completo');
      
    } catch (error) {
      logger.error('Erro ao carregar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // CORREÇÃO: Não fazer retry em caso de erro real
      if (retryCount === 0) {
        setError(errorMessage);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // CORREÇÃO: Configurar listener de mudanças de auth mais simples
  useEffect(() => {
    logger.info('Inicializando AuthProvider');
    
    let mounted = true;
    let sessionCheckTimeout: NodeJS.Timeout;

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        logger.info('Auth state changed:', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // CORREÇÃO: Usar setTimeout para evitar deadlocks, mas com delay menor
          setTimeout(() => {
            if (mounted) {
              loadUserProfile(session.user.id, session.user.email);
            }
          }, 100); // REDUZIDO de 0 para 100ms para garantir estabilidade
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setError(null);
        }
      }
    );

    // CORREÇÃO: Verificar sessão existente com timeout
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          logger.error('Erro ao obter sessão:', error);
          setError(error.message);
        } else {
          logger.info('Sessão inicial:', { hasSession: !!session });
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            setTimeout(() => {
              if (mounted) {
                loadUserProfile(session.user.id, session.user.email);
              }
            }, 200); // Delay ligeiramente maior para sessão inicial
          }
        }
      } catch (error) {
        logger.error('Erro inesperado ao verificar sessão:', error);
        if (mounted) {
          setError('Erro ao verificar autenticação');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // CORREÇÃO: Timeout de 3s para verificação inicial
    sessionCheckTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        logger.warn('Timeout na verificação inicial, continuando');
        setIsLoading(false);
      }
    }, 3000); // REDUZIDO de tempo indefinido para 3s

    checkInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (sessionCheckTimeout) {
        clearTimeout(sessionCheckTimeout);
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
