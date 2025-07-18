import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchUserProfile, signOutUser } from './utils';
import { AuthContextType } from './types';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { clearProfileCache } from './utils/profileUtils/userProfileFunctions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  
  // Flags de controle para evitar loops
  const hasTriedProfileLoad = useRef(false);
  const isCurrentlyLoading = useRef(false);

  // Memoizar informações derivadas do perfil
  const isAdmin = profile?.user_roles?.name === 'admin';
  const isFormacao = profile?.user_roles?.name === 'formacao';
  const hasCompletedOnboarding = profile?.onboarding_completed || false;

  // Função estável para carregar perfil - sem dependências instáveis
  const loadUserProfile = useCallback(async (userId: string) => {
    if (isCurrentlyLoading.current) {
      logger.info('[AUTH] 🔄 Carregamento já em progresso, ignorando');
      return;
    }

    try {
      isCurrentlyLoading.current = true;
      logger.info('[AUTH] 🔄 Carregando perfil do usuário', { userId });
      
      const userProfile = await fetchUserProfile(userId);
      
      if (userProfile) {
        setProfile(userProfile);
        hasTriedProfileLoad.current = true;
        logger.info('[AUTH] ✅ Perfil carregado com sucesso', { 
          name: userProfile.name,
          role: userProfile.user_roles?.name 
        });
      } else {
        logger.warn('[AUTH] ⚠️ Perfil não encontrado', { userId });
        setProfile(null);
      }
    } catch (error) {
      logger.error('[AUTH] ❌ Erro ao carregar perfil', { userId, error });
      setAuthError(error as Error);
      setProfile(null);
    } finally {
      isCurrentlyLoading.current = false;
    }
  }, []); // SEM dependências instáveis

  // Função para forçar reload do perfil - estável
  const forceReloadProfile = useCallback(async () => {
    if (!user?.id) {
      logger.warn('[AUTH] 🚫 Não é possível recarregar perfil sem usuário');
      return;
    }

    logger.info('[AUTH] 🔄 FORÇA RELOAD iniciado');
    
    // Limpar cache e flags
    clearProfileCache(user.id);
    hasTriedProfileLoad.current = false;
    
    // Recarregar
    await loadUserProfile(user.id);
  }, []); // SEM user?.id nas dependências

  const signIn = async (email: string, password: string) => {
    try {
      setAuthError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { error: undefined };
    } catch (error) {
      const authError = error as Error;
      setAuthError(authError);
      return { error: authError };
    }
  };

  const signInAsMember = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const signInAsAdmin = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const signOut = async () => {
    try {
      await signOutUser();
      
      // Limpar estado local
      setSession(null);
      setUser(null);
      setProfile(null);
      setAuthError(null);
      hasTriedProfileLoad.current = false;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Setup da autenticação
  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      try {
        // Configurar listener de mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            logger.info('[AUTH] 🔄 Estado de auth mudou', { event, hasSession: !!session });
            
            setSession(session);
            setUser(session?.user ?? null);
            
            if (event === 'SIGNED_IN' && session?.user) {
              // Reset flags para novo usuário
              hasTriedProfileLoad.current = false;
              
              // Aguardar um pouco antes de carregar perfil (evitar conflitos)
              setTimeout(() => {
                if (mounted && !hasTriedProfileLoad.current) {
                  loadUserProfile(session.user.id);
                }
              }, 100);
              
            } else if (event === 'SIGNED_OUT') {
              setProfile(null);
              hasTriedProfileLoad.current = false;
            }
          }
        );

        // Verificar sessão existente
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user && !hasTriedProfileLoad.current) {
            await loadUserProfile(currentSession.user.id);
          }
        }

        return () => {
          subscription.unsubscribe();
        };
        
      } catch (error) {
        logger.error('[AUTH] Erro no setup:', error);
        if (mounted) {
          setAuthError(error as Error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    setupAuth();

    return () => {
      mounted = false;
    };
  }, []); // SEM dependências

  // Tentar carregar perfil se usuário existe mas perfil não
  useEffect(() => {
    if (user?.id && !profile && !isLoading && !hasTriedProfileLoad.current && !isCurrentlyLoading.current) {
      logger.info('[AUTH] 🔄 Tentando carregar perfil ausente');
      loadUserProfile(user.id);
    }
  }, [user?.id, profile, isLoading, loadUserProfile]);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
