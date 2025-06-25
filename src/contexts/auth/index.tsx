
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { fetchUserProfile, createUserProfileIfNeeded } from './utils/profileUtils/userProfileFunctions';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContextType } from './types';
import { logger } from '@/utils/logger';
import { getUserRoleName } from '@/lib/supabase/types';

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

  // Função para limpeza completa de auth
  const cleanupAuthState = () => {
    setUser(null);
    setSession(null);  
    setProfile(null);
    setError(null);
  };

  // Função simplificada para carregar perfil
  const loadUserProfile = async (userId: string, email?: string) => {
    try {
      setError(null);
      
      logger.info('[AUTH] Carregando perfil:', { userId: userId.substring(0, 8) + '***' });
      
      let userProfile = await fetchUserProfile(userId);
      
      // Se não encontrou perfil, tentar criar apenas UMA vez
      if (!userProfile && email) {
        logger.info('[AUTH] Criando perfil...');
        try {
          userProfile = await createUserProfileIfNeeded(userId, email);
        } catch (createError) {
          logger.warn('[AUTH] Falha ao criar perfil, continuando sem perfil');
        }
      }
      
      if (userProfile) {
        setProfile(userProfile);
        logger.info('[AUTH] Perfil carregado com sucesso:', {
          role: getUserRoleName(userProfile)
        });
      } else {
        logger.warn('[AUTH] Continuando sem perfil de usuário');
      }
      
    } catch (error) {
      logger.error('[AUTH] Erro ao carregar perfil:', error);
      setProfile(null);
    }
  };

  // Auth state listener simplificado e mais robusto
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
          // Delay para evitar conflitos
          setTimeout(() => {
            if (mounted) {
              loadUserProfile(session.user.id, session.user.email);
            }
          }, 500);
        } else if (event === 'SIGNED_OUT') {
          cleanupAuthState();
        }
      }
    );

    // Verificar sessão inicial
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
          }, 1000);
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

    // Timeout para finalizar loading
    initTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        logger.warn('[AUTH] Timeout de inicialização (8s), finalizando loading');
        setIsLoading(false);
      }
    }, 8000);

    checkInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, []);

  // Função de refresh manual otimizada
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id, user.email);
    }
  };

  // Calcular isAdmin e isFormacao baseado no profile
  const userRole = getUserRoleName(profile);
  const isAdmin = userRole === 'admin';
  const isFormacao = userRole === 'formacao';

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    error,
    refreshProfile,
    isAdmin,
    isFormacao,
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
