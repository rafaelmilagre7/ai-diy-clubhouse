
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

  // Função simplificada para carregar perfil
  const loadUserProfile = async (userId: string, email?: string) => {
    try {
      setProfileLoading(true);
      setError(null);
      
      logger.info('Carregando perfil:', { userId, email });
      
      let userProfile = await fetchUserProfile(userId);
      
      // Se não encontrou perfil, tentar criar
      if (!userProfile && email) {
        logger.info('Perfil não encontrado, criando...');
        userProfile = await createUserProfileIfNeeded(userId, email);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        logger.info('Perfil carregado com sucesso');
      } else {
        logger.warn('Não foi possível carregar o perfil');
      }
      
    } catch (error) {
      logger.error('Erro ao carregar perfil:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setProfileLoading(false);
    }
  };

  // Configurar listener de mudanças de auth - SIMPLIFICADO
  useEffect(() => {
    logger.info('Inicializando AuthProvider');
    
    let mounted = true;
    
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        logger.info('Auth state changed:', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Usar setTimeout para evitar deadlocks
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

    // Verificar sessão existente
    const initializeAuth = async () => {
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
            }, 100);
          }
        }
      } catch (error) {
        logger.error('Erro na inicialização:', error);
        setError(error instanceof Error ? error.message : 'Erro na inicialização');
      } finally {
        if (mounted) {
          // CRÍTICO: Sempre definir isLoading como false após timeout
          setTimeout(() => {
            if (mounted) {
              setIsLoading(false);
            }
          }, 3000); // Máximo 3 segundos
        }
      }
    };

    initializeAuth();

    // Fallback de emergência - força isLoading = false após 5 segundos
    const emergencyTimeout = setTimeout(() => {
      if (mounted) {
        logger.warn('Fallback de emergência - forçando isLoading = false');
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(emergencyTimeout);
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
