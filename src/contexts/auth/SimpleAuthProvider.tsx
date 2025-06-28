
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/userProfile';
import { fetchUserProfile, createUserProfileIfNeeded } from './utils/profileUtils/userProfileFunctions';
import { useAuthCache } from '@/hooks/auth/useAuthCache';
import { logger } from '@/utils/logger';

interface SimpleAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isSigningIn: boolean;
  error: Error | null;
  isAdmin: boolean;
  isFormacao: boolean;
  signOut: () => Promise<{ success: boolean; error?: Error | null }>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

interface SimpleAuthProviderProps {
  children: ReactNode;
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Cache system
  const { cachedData, saveToCache, clearCache, hasValidCache } = useAuthCache();

  // Load from cache immediately if available
  useEffect(() => {
    if (hasValidCache && cachedData) {
      logger.info('[SIMPLE-AUTH] Carregando dados do cache');
      setUser(cachedData.user);
      setSession(cachedData.session);
      setProfile(cachedData.profile);
      setIsLoading(false); // Set loading to false immediately for cached data
    }
  }, [hasValidCache, cachedData]);

  // Profile helper functions
  const isAdmin = profile?.user_roles?.name === 'admin';
  const isFormacao = profile?.user_roles?.name === 'formacao';

  // Load user profile
  const loadUserProfile = async (userId: string, email?: string) => {
    try {
      logger.info('[SIMPLE-AUTH] Carregando perfil do usuário:', { userId: userId.substring(0, 8) });
      
      let userProfile = await fetchUserProfile(userId);
      
      if (!userProfile && email) {
        logger.info('[SIMPLE-AUTH] Perfil não encontrado, criando...');
        userProfile = await createUserProfileIfNeeded(userId, email);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        logger.info('[SIMPLE-AUTH] Perfil carregado com sucesso');
        return userProfile;
      } else {
        throw new Error('Não foi possível carregar o perfil do usuário');
      }
    } catch (error) {
      logger.error('[SIMPLE-AUTH] Erro ao carregar perfil:', error);
      setError(error instanceof Error ? error : new Error('Erro desconhecido'));
      throw error;
    }
  };

  // Sign out function
  const signOut = async (): Promise<{ success: boolean; error?: Error | null }> => {
    try {
      setIsSigningIn(true);
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        logger.error('[SIMPLE-AUTH] Erro ao fazer logout:', signOutError);
        return { success: false, error: signOutError };
      }
      
      // Clear all state and cache
      setUser(null);
      setSession(null);
      setProfile(null);
      setError(null);
      clearCache();
      
      logger.info('[SIMPLE-AUTH] Logout realizado com sucesso');
      return { success: true };
    } catch (error) {
      logger.error('[SIMPLE-AUTH] Erro inesperado no logout:', error);
      return { success: false, error: error instanceof Error ? error : new Error('Erro inesperado') };
    } finally {
      setIsSigningIn(false);
    }
  };

  // Initialize auth
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        logger.info('[SIMPLE-AUTH] Inicializando autenticação');
        
        // Get current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!mounted) return;

        if (currentSession?.user) {
          logger.info('[SIMPLE-AUTH] Sessão encontrada:', { userId: currentSession.user.id.substring(0, 8) });
          
          setUser(currentSession.user);
          setSession(currentSession);
          
          // Load profile in background (don't wait if we have cache)
          if (!hasValidCache) {
            try {
              const userProfile = await loadUserProfile(currentSession.user.id, currentSession.user.email);
              if (mounted && userProfile) {
                // Save to cache
                saveToCache(currentSession.user, currentSession, userProfile);
              }
            } catch (profileError) {
              logger.error('[SIMPLE-AUTH] Erro ao carregar perfil na inicialização:', profileError);
              // Don't fail the entire auth if profile fails
            }
          } else {
            // Background validation when using cache
            loadUserProfile(currentSession.user.id, currentSession.user.email)
              .then(userProfile => {
                if (mounted && userProfile) {
                  saveToCache(currentSession.user, currentSession, userProfile);
                }
              })
              .catch(error => {
                logger.warn('[SIMPLE-AUTH] Erro na validação em background:', error);
              });
          }
        } else {
          logger.info('[SIMPLE-AUTH] Nenhuma sessão encontrada');
          setUser(null);
          setSession(null);
          setProfile(null);
          clearCache();
        }
      } catch (error) {
        logger.error('[SIMPLE-AUTH] Erro na inicialização:', error);
        if (mounted) {
          setError(error instanceof Error ? error : new Error('Erro na inicialização'));
          setUser(null);
          setSession(null);
          setProfile(null);
          clearCache();
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        logger.info('[SIMPLE-AUTH] Auth state changed:', { event, hasSession: !!newSession });
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          try {
            const userProfile = await loadUserProfile(newSession.user.id, newSession.user.email);
            if (mounted && userProfile) {
              saveToCache(newSession.user, newSession, userProfile);
            }
          } catch (error) {
            logger.error('[SIMPLE-AUTH] Erro ao carregar perfil no sign in:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setError(null);
          clearCache();
        }
      }
    );

    // Only initialize if we don't have valid cache (for immediate UI)
    if (!hasValidCache) {
      initializeAuth();
    } else {
      // Still validate in background
      setIsLoading(false);
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        if (currentSession?.user && mounted) {
          loadUserProfile(currentSession.user.id, currentSession.user.email)
            .then(userProfile => {
              if (mounted && userProfile) {
                saveToCache(currentSession.user, currentSession, userProfile);
              }
            })
            .catch(error => {
              logger.warn('[SIMPLE-AUTH] Erro na validação de cache:', error);
            });
        }
      });
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hasValidCache, cachedData]); // Add dependencies for cache

  const contextValue: SimpleAuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isSigningIn,
    error,
    isAdmin,
    isFormacao,
    signOut
  };

  return (
    <SimpleAuthContext.Provider value={contextValue}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = (): SimpleAuthContextType => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
