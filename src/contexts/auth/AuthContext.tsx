import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { useAuthStateManager } from './hooks/useAuthStateManager';
import { navigationCache } from '@/utils/navigationCache';
import { clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { toast } from "sonner";
import { clearLocalStorage, clearAuthTokens } from '@/utils/storageHelper';

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

  // CORREÇÃO DE SEGURANÇA: Verificação de admin APENAS via banco de dados
  const isAdmin = Boolean(profile?.user_roles?.name === 'admin');

  const isFormacao = Boolean(
    profile?.user_roles?.name === 'formacao' || 
    profile?.role === 'formacao'
  );

  // Configurar sessão na inicialização
  useEffect(() => {
    logger.info('[AUTH-CONTEXT] Inicializando AuthProvider', {
      component: 'AuthContext'
    });
    setupAuthSession();
  }, [setupAuthSession]);

  // Listener para mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('[AUTH-CONTEXT] Auth state change:', {
          event,
          component: 'AuthContext'
        });
        
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

  // Função de logout centralizada e robusta
  const signOut = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user && !session) {
      // Já está deslogado, só limpa state/caches
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      navigationCache.clear();
      clearProfileCache();
      clearAuthTokens();
      clearLocalStorage();
      toast.success('Logout realizado com sucesso.');
      window.location.href = '/login';
      return { success: true };
    }
    try {
      logger.info('[AUTH-CONTEXT] Iniciando logout global', { component: 'AuthContext' });

      // Limpar caches de navegação e perfil antes
      navigationCache.clear();
      clearProfileCache();

      // Limpar tokens
      clearAuthTokens();
      clearLocalStorage();

      // Forçar signOut global (ajuda a evitar limbos - mesmo que falhe, continua)
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        logger.warn('[AUTH-CONTEXT] Falha ao chamar signOut global:', err);
      }

      // Limpar state local
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsLoading(false);

      logger.info('[AUTH-CONTEXT] Logout concluído. Redirecionando para login');

      toast.success('Logout realizado com sucesso.');
      // Preferir navegação por hard redirect para garantir estado limpo
      window.location.href = '/login';
      return { success: true };

    } catch (error) {
      logger.error('[AUTH-CONTEXT] Erro crítico no logout:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        component: 'AuthContext'
      });
      // Forçar limpeza mesmo com erro
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      navigationCache.clear();
      clearProfileCache();
      clearAuthTokens();
      clearLocalStorage();
      toast.error('Erro interno ao realizar logout. Por favor, faça login novamente.');
      window.location.href = '/login';
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }, [user, session]);

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

export default AuthProvider;
