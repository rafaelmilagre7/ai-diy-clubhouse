
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { fetchUserProfile, createUserProfileIfNeeded, clearProfileCache } from './utils/profileUtils/userProfileFunctions';
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
  
  // Refs para controle de estado e prevenção de loops
  const isMounted = useRef(true);
  const profileLoadPromise = useRef<Promise<void> | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      retryCount.current = 0;
      
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
      
      // Limpar cache de perfil para garantir dados fresh
      clearProfileCache();
      
      logger.info('[AUTH] Login realizado com sucesso', { email });
      return {};
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Erro ao fazer login');
      logger.error('[AUTH] Erro inesperado no login:', authError);
      setAuthError(authError);
      return { error: authError };
    }
    // Loading será controlado pelo onAuthStateChange
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
      
      // Limpar cache
      clearProfileCache();
      retryCount.current = 0;

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

  // Função para forçar reload do perfil (limpar cache)
  const forceReloadProfile = useCallback(async () => {
    if (user?.id) {
      logger.info('[AUTH] 🔄 FORCE RELOAD - Limpando cache e recarregando perfil');
      clearProfileCache();
      profileLoadPromise.current = null;
      retryCount.current = 0;
      await loadUserProfile(user.id);
    }
  }, [user?.id]);

  const loadUserProfile = useCallback(async (userId: string): Promise<void> => {
    // Evitar múltiplas chamadas simultâneas
    if (profileLoadPromise.current) {
      return profileLoadPromise.current;
    }

    profileLoadPromise.current = (async () => {
      try {
        if (!isMounted.current) return;
        
        logger.info('[AUTH] 🔍 Carregando perfil do usuário...', { 
          userId, 
          retry: retryCount.current 
        });
        
        const userProfile = await fetchUserProfile(userId);
        
        if (!isMounted.current) return;
        
        if (userProfile) {
          logger.info('[AUTH] Perfil carregado com sucesso', { 
            userId, 
            profileId: userProfile.id,
            role: userProfile.user_roles?.name 
          });
          setProfile(userProfile);
          retryCount.current = 0;
        } else {
          logger.warn('[AUTH] Perfil não encontrado', { userId, retry: retryCount.current });
          
          // Retry com backoff exponencial
          if (retryCount.current < maxRetries) {
            retryCount.current++;
            const delay = Math.pow(2, retryCount.current) * 1000; // 2s, 4s, 8s
            
            logger.info('[AUTH] Reagendando busca de perfil', { 
              userId, 
              retry: retryCount.current,
              delay 
            });
            
            setTimeout(() => {
              if (isMounted.current) {
                profileLoadPromise.current = null;
                loadUserProfile(userId);
              }
            }, delay);
          } else {
            logger.error('[AUTH] Máximo de tentativas excedido para carregamento de perfil', { userId });
            setProfile(null);
          }
        }
      } catch (error) {
        if (!isMounted.current) return;
        
        logger.error('[AUTH] Erro ao carregar perfil:', { userId, error, retry: retryCount.current });
        
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          const delay = Math.pow(2, retryCount.current) * 1000;
          
          setTimeout(() => {
            if (isMounted.current) {
              profileLoadPromise.current = null;
              loadUserProfile(userId);
            }
          }, delay);
        } else {
          setProfile(null);
        }
      } finally {
        profileLoadPromise.current = null;
      }
    })();

    return profileLoadPromise.current;
  }, []);

  useEffect(() => {
    isMounted.current = true;

    const initializeAuth = async () => {
      try {
        logger.info('[AUTH] Inicializando sistema de autenticação...');

        // 1. Configurar listener de mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!isMounted.current) return;

            logger.info('[AUTH] Estado de autenticação mudou', { 
              event, 
              hasSession: !!session,
              userId: session?.user?.id 
            });

            // Atualizar session e user de forma síncrona
            setSession(session);
            setUser(session?.user || null);
            setAuthError(null);

            // Buscar perfil de forma assíncrona apenas para SIGNED_IN
            if (event === 'SIGNED_IN' && session?.user?.id) {
              // Usar setTimeout(0) para evitar deadlock
              setTimeout(() => {
                if (!isMounted.current) return;
                
                loadUserProfile(session.user.id)
                  .then(() => {
                    if (isMounted.current) {
                      setIsLoading(false);
                    }
                  })
                  .catch((error) => {
                    logger.error('[AUTH] Erro ao carregar perfil após login:', error);
                    if (isMounted.current) {
                      setProfile(null);
                      setIsLoading(false);
                    }
                  });
              }, 0);
            } else if (event === 'SIGNED_OUT') {
              setProfile(null);
              setIsLoading(false);
              clearProfileCache();
              retryCount.current = 0;
            } else if (event === 'TOKEN_REFRESHED') {
              logger.info('[AUTH] Token refreshed, verificando se precisa recarregar perfil');
              if (session?.user?.id && !profile) {
                setTimeout(() => {
                  if (isMounted.current) {
                    loadUserProfile(session.user.id);
                  }
                }, 0);
              }
            }
          }
        );

        // 2. Verificar sessão existente
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!isMounted.current) return;

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
            if (isMounted.current) {
              setProfile(null);
            }
          }
        } else {
          logger.info('[AUTH] Nenhuma sessão ativa encontrada');
        }

        if (isMounted.current) {
          setIsLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        logger.error('[AUTH] Erro na inicialização:', error);
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted.current = false;
      clearProfileCache();
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
    forceReloadProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
