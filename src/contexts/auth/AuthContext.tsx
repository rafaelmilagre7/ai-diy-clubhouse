
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { useAuthStateManager } from './hooks/useAuthStateManager';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  signOut: () => Promise<{ success: boolean; error?: string }>;
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

  // Usar o hook de gerenciamento de estado
  const { setupAuthSession } = useAuthStateManager({
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  });

  // CORREÇÃO: Verificação de admin mais robusta
  const isAdmin = Boolean(
    user && (
      // Verificação por email (prioridade máxima)
      ['rafael@viverdeia.ai', 'admin@viverdeia.ai', 'admin@teste.com'].includes(user.email?.toLowerCase() || '') ||
      // Verificação por role no perfil
      profile?.user_roles?.name === 'admin' ||
      // Verificação por role direto (legacy)
      profile?.role === 'admin'
    )
  );

  const isFormacao = Boolean(
    profile?.user_roles?.name === 'formacao' || 
    profile?.role === 'formacao'
  );

  // Configurar sessão na inicialização
  useEffect(() => {
    logger.info('[AUTH-CONTEXT] Inicializando AuthProvider');
    setupAuthSession();
  }, [setupAuthSession]);

  // Listener para mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('[AUTH-CONTEXT] Auth state change:', event);
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        } else if (session?.user) {
          setSession(session);
          setUser(session.user);
          // O perfil será carregado pelo setupAuthSession
          if (event === 'SIGNED_IN') {
            setupAuthSession();
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setupAuthSession]);

  // Função de logout
  const signOut = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      logger.info('[AUTH-CONTEXT] Iniciando logout');
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

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    signOut,
    setProfile,
    setIsLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
