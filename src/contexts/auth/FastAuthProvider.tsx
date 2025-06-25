
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { useSmartTimeout } from './hooks/useSmartTimeout';
import { profileCache } from './utils/profileCache';
import { logger } from '@/utils/logger';

interface FastAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFormacao: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const FastAuthContext = createContext<FastAuthContextType | undefined>(undefined);

interface FastAuthProviderProps {
  children: ReactNode;
}

export const FastAuthProvider: React.FC<FastAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { startTimeout, clearTimeout: clearSmartTimeout } = useSmartTimeout({
    context: 'fast-auth',
    authTimeout: 4000, // 4s para auth
    profileTimeout: 3000, // 3s para profile
  });

  // Carregamento paralelo e otimizado do perfil
  const loadUserProfile = useCallback(async (userId: string, email?: string, forceRefresh = false) => {
    try {
      // Verificar cache primeiro (se não forçar refresh)
      if (!forceRefresh) {
        const cachedProfile = profileCache.get(userId);
        if (cachedProfile) {
          logger.info('[FAST-AUTH] Profile carregado do cache', { userId });
          setProfile(cachedProfile);
          return cachedProfile;
        }
      }

      const timeoutId = startTimeout('profile', () => {
        logger.warn('[FAST-AUTH] Timeout no carregamento do profile');
        setError('Timeout ao carregar perfil');
      });

      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select(`*, user_roles (*)`)
        .eq('id', userId)
        .single();

      clearSmartTimeout(timeoutId);

      if (profileError) {
        // Se perfil não existe, tentar criar
        if (profileError.code === 'PGRST116' && email) {
          logger.info('[FAST-AUTH] Criando perfil para novo usuário');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: email,
              name: email.split('@')[0],
              created_at: new Date().toISOString()
            })
            .select(`*, user_roles (*)`)
            .single();

          if (!createError && newProfile) {
            const profile = newProfile as unknown as UserProfile;
            profileCache.set(userId, profile);
            setProfile(profile);
            return profile;
          }
        }
        throw profileError;
      }

      if (userProfile) {
        const profile = userProfile as unknown as UserProfile;
        profileCache.set(userId, profile);
        setProfile(profile);
        return profile;
      }

      return null;
    } catch (error) {
      logger.error('[FAST-AUTH] Erro ao carregar perfil:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar perfil');
      return null;
    }
  }, [startTimeout, clearSmartTimeout]);

  // Função otimizada de signOut
  const signOut = useCallback(async () => {
    try {
      logger.info('[FAST-AUTH] Iniciando logout');
      
      // Limpar cache local
      if (user?.id) {
        profileCache.delete(user.id);
      }
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;
      
      // Limpar estado local
      setUser(null);
      setSession(null);
      setProfile(null);
      setError(null);
      
      logger.info('[FAST-AUTH] Logout concluído');
      return { success: true };
    } catch (error) {
      logger.error('[FAST-AUTH] Erro no logout:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro no logout' 
      };
    }
  }, [user?.id]);

  // Função otimizada de signIn
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const timeoutId = startTimeout('auth', () => {
        logger.warn('[FAST-AUTH] Timeout no login');
        setError('Timeout na autenticação');
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      clearSmartTimeout(timeoutId);

      if (error) throw error;
      
      logger.info('[FAST-AUTH] Login realizado com sucesso');
      return { success: true };
    } catch (error) {
      logger.error('[FAST-AUTH] Erro no login:', error);
      setError(error instanceof Error ? error.message : 'Erro no login');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro no login' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [startTimeout, clearSmartTimeout]);

  // Função otimizada de signUp
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;
      
      logger.info('[FAST-AUTH] Cadastro realizado com sucesso');
      return { success: true };
    } catch (error) {
      logger.error('[FAST-AUTH] Erro no cadastro:', error);
      setError(error instanceof Error ? error.message : 'Erro no cadastro');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro no cadastro' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh manual do perfil
  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadUserProfile(user.id, user.email, true);
    }
  }, [user, loadUserProfile]);

  // Inicialização otimizada
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        logger.info('[FAST-AUTH] Inicializando autenticação');
        
        // Configurar listener de mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            logger.info('[FAST-AUTH] Auth state changed:', { event, hasSession: !!session });
            
            setSession(session);
            setUser(session?.user ?? null);
            
            if (event === 'SIGNED_IN' && session?.user) {
              // Carregamento paralelo e sem bloquear UI
              setTimeout(() => {
                if (mounted) {
                  loadUserProfile(session.user.id, session.user.email);
                }
              }, 0);
            } else if (event === 'SIGNED_OUT') {
              setProfile(null);
              setError(null);
            }
          }
        );

        // Verificar sessão existente com timeout
        const sessionTimeoutId = startTimeout('auth', () => {
          logger.warn('[FAST-AUTH] Timeout na verificação de sessão');
          if (mounted) {
            setError('Timeout na verificação de sessão');
            setIsLoading(false);
          }
        });

        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearSmartTimeout(sessionTimeoutId);

        if (!mounted) return;

        if (error) {
          logger.error('[FAST-AUTH] Erro ao obter sessão:', error);
          setError(error.message);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Carregamento paralelo do perfil se há usuário
          if (session?.user) {
            loadUserProfile(session.user.id, session.user.email);
          }
        }

        setIsLoading(false);
        return subscription;
      } catch (error) {
        if (mounted) {
          logger.error('[FAST-AUTH] Erro na inicialização:', error);
          setError(error instanceof Error ? error.message : 'Erro na inicialização');
          setIsLoading(false);
        }
      }
    };

    let subscriptionPromise = initializeAuth();

    return () => {
      mounted = false;
      subscriptionPromise.then(subscription => {
        subscription?.unsubscribe();
      });
    };
  }, [startTimeout, clearSmartTimeout, loadUserProfile]);

  const contextValue: FastAuthContextType = {
    user,
    session,
    profile,
    isLoading,
    error,
    isAdmin: profile?.user_roles?.name === 'admin',
    isFormacao: profile?.user_roles?.name === 'formacao',
    refreshProfile,
    signOut,
    signIn,
    signUp
  };

  return (
    <FastAuthContext.Provider value={contextValue}>
      {children}
    </FastAuthContext.Provider>
  );
};

export const useFastAuth = (): FastAuthContextType => {
  const context = useContext(FastAuthContext);
  if (context === undefined) {
    throw new Error('useFastAuth must be used within a FastAuthProvider');
  }
  return context;
};
