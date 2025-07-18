
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { fetchUserProfile, createUserProfileIfNeeded } from './utils/profileUtils';
import { AuthContextType } from './types';
import { logger } from '@/utils/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      logger.info('[AUTH] Iniciando login...', { email });

      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        logger.error('[AUTH] Erro no login:', error);
        setAuthError(error);
        return { error };
      }
      
      setAuthError(null);
      logger.info('[AUTH] Login realizado com sucesso', { email });
      return {};
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Erro ao fazer login');
      logger.error('[AUTH] Erro inesperado no login:', authError);
      setAuthError(authError);
      return { error: authError };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInAsMember = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const signInAsAdmin = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      logger.info('[AUTH] Iniciando logout...');

      // Limpar dados locais primeiro
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthError(null);

      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        logger.error('[AUTH] Erro no logout:', error);
        return { success: false, error };
      }

      logger.info('[AUTH] Logout realizado com sucesso');
      return { success: true };
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Erro ao fazer logout');
      logger.error('[AUTH] Erro inesperado no logout:', authError);
      return { success: false, error: authError };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      logger.info('[AUTH] Carregando perfil do usuário...', { userId });
      
      const userProfile = await fetchUserProfile(userId);
      
      if (userProfile) {
        logger.info('[AUTH] Perfil carregado com sucesso', { 
          userId, 
          profileId: userProfile.id,
          role: userProfile.user_roles?.name 
        });
        setProfile(userProfile);
      } else {
        logger.warn('[AUTH] Perfil não encontrado', { userId });
        setProfile(null);
      }
    } catch (error) {
      logger.error('[AUTH] Erro ao carregar perfil:', error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        logger.info('[AUTH] Inicializando sistema de autenticação...');

        // 1. Configurar listener de mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            logger.info('[AUTH] Estado de autenticação mudou', { 
              event, 
              hasSession: !!session,
              userId: session?.user?.id 
            });

            // Atualizar session e user de forma síncrona
            setSession(session);
            setUser(session?.user || null);

            // Buscar perfil de forma assíncrona apenas para SIGNED_IN
            if (event === 'SIGNED_IN' && session?.user?.id) {
              setTimeout(async () => {
                if (!mounted) return;
                try {
                  await loadUserProfile(session.user.id);
                  if (mounted) {
                    setIsLoading(false);
                  }
                } catch (error) {
                  logger.error('[AUTH] Erro ao carregar perfil após login:', error);
                  if (mounted) {
                    setProfile(null);
                    setIsLoading(false);
                  }
                }
              }, 100);
            } else if (event === 'SIGNED_OUT') {
              setProfile(null);
              setIsLoading(false);
            }
          }
        );

        // 2. Verificar sessão existente
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession?.user?.id) {
          logger.info('[AUTH] Sessão existente encontrada', { 
            userId: currentSession.user.id 
          });
          
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Buscar perfil
          try {
            await loadUserProfile(currentSession.user.id);
          } catch (error) {
            logger.error('[AUTH] Erro ao carregar perfil da sessão existente:', error);
            if (mounted) {
              setProfile(null);
            }
          }
        } else {
          logger.info('[AUTH] Nenhuma sessão ativa encontrada');
        }

        if (mounted) {
          setIsLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        logger.error('[AUTH] Erro na inicialização:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [loadUserProfile]);

  const isAdmin = profile?.user_roles?.name === 'admin' || profile?.role_id === 'admin';
  const isFormacao = profile?.user_roles?.name === 'formacao' || profile?.role_id === 'formacao';
  const hasCompletedOnboarding = profile?.onboarding_completed || false;

  const value: AuthContextType = {
    session,
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    authError,
    hasCompletedOnboarding,
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
