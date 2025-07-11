
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { useAuthStateManager } from './hooks/useAuthStateManager';
import { clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  authError: Error | null;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  signInAsMember: (email: string, password: string) => Promise<{ error?: Error }>;
  signInAsAdmin: (email: string, password: string) => Promise<{ error?: Error }>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Usar o hook de gerenciamento de estado otimizado
  const { setupAuthSession } = useAuthStateManager({
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  });

  // CORREÇÃO DE SEGURANÇA: Verificação de admin APENAS via banco de dados
  const isAdmin = Boolean(profile?.user_roles?.name === 'admin');

  const isFormacao = Boolean(
    profile?.user_roles?.name === 'formacao' || 
    profile?.role === 'formacao'
  );

  // OTIMIZAÇÃO: Configurar sessão na inicialização - APENAS UMA VEZ
  useEffect(() => {
    let mounted = true;
    let authListener: any = null;

    const initializeAuth = async () => {
      if (!mounted) return;

      logger.info('[AUTH-CONTEXT] Inicializando AuthProvider');
      
      try {
        // PRIMEIRO: Configurar listener para mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            logger.info('[AUTH-CONTEXT] Auth state change:', { event });
            
            if (event === 'SIGNED_OUT' || !session) {
              setSession(null);
              setUser(null);
              setProfile(null);
              setIsLoading(false);
              clearProfileCache();
            } else if (session?.user) {
              setSession(session);
              setUser(session.user);
              
              // CORREÇÃO: Defer setup para evitar deadlock
              if (event === 'SIGNED_IN') {
                setTimeout(() => {
                  if (mounted) {
                    setupAuthSession();
                  }
                }, 0);
              }
            }
          }
        );
        
        authListener = subscription;

        // SEGUNDO: Verificar sessão existente (APENAS uma vez)
        await setupAuthSession();

      } catch (error) {
        logger.error('[AUTH-CONTEXT] Erro na inicialização:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Cleanup
    return () => {
      mounted = false;
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []); // IMPORTANTE: Array vazio para executar apenas uma vez

  // Função de logout otimizada
  const signOut = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      logger.info('[AUTH-CONTEXT] Iniciando logout');
      
      // Limpar cache primeiro
      clearProfileCache();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('[AUTH-CONTEXT] Erro no logout:', error);
        return { success: false, error: error.message };
      }
      
      // Limpar estado local
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      
      logger.info('[AUTH-CONTEXT] Logout realizado com sucesso');
      return { success: true };
      
    } catch (error) {
      logger.error('[AUTH-CONTEXT] Erro crítico no logout:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }, []);

  // Método signIn
  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: Error }> => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error);
        return { error };
      }
      return {};
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erro desconhecido');
      setAuthError(err);
      return { error: err };
    }
  }, []);

  // Método signInAsMember (alias para signIn)
  const signInAsMember = useCallback(async (email: string, password: string): Promise<{ error?: Error }> => {
    return signIn(email, password);
  }, [signIn]);

  // Método signInAsAdmin (alias para signIn)
  const signInAsAdmin = useCallback(async (email: string, password: string): Promise<{ error?: Error }> => {
    return signIn(email, password);
  }, [signIn]);

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    authError,
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
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
