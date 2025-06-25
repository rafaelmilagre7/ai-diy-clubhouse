
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

  // CORREÇÃO: Função para limpeza completa de auth
  const cleanupAuthState = () => {
    setUser(null);
    setSession(null);  
    setProfile(null);
    setError(null);
  };

  // CORREÇÃO: Função simplificada para carregar perfil (sem retry infinito)
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
        logger.info('[AUTH] Perfil carregado com sucesso');
      } else {
        logger.warn('[AUTH] Continuando sem perfil de usuário');
      }
      
    } catch (error) {
      logger.error('[AUTH] Erro ao carregar perfil:', error);
      // CORREÇÃO: Não definir erro como crítico, apenas continuar
      setProfile(null);
    }
  };

  // CORREÇÃO: Auth state listener otimizado
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
          // CORREÇÃO: Pequeno delay para evitar conflitos
          setTimeout(() => {
            if (mounted) {
              loadUserProfile(session.user.id, session.user.email);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          // CORREÇÃO: Limpeza completa no logout
          cleanupAuthState();
        }
      }
    );

    // CORREÇÃO: Verificar sessão inicial com timeout reduzido
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

    // CORREÇÃO: Timeout de inicialização mais agressivo (1.5s)
    initTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        logger.warn('[AUTH] Timeout de inicialização, finalizando loading');
        setIsLoading(false);
      }
    }, 1500);

    checkInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, []);

  // CORREÇÃO: Função de refresh manual otimizada
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
