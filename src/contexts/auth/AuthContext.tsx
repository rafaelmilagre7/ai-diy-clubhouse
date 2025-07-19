
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { signOutUser } from './utils/sessionUtils';
import type { AuthContextType } from './types';
import { UserProfile } from '@/lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const maxRetries = 3;

  // CORREÇÃO: Removido useSessionManager() daqui para quebrar dependência circular
  // Session management agora será tratado pelo SessionManagerWrapper

  // Função para buscar perfil do usuário
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            name,
            permissions
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.warn(`[AUTH] Perfil não encontrado para usuário ${userId}:`, error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[AUTH] Erro ao buscar perfil:', error);
      return null;
    }
  };

  // Função para processar mudanças de autenticação
  const processAuthChange = async (session: Session | null) => {
    console.log('[AUTH] Processando mudança de autenticação:', {
      hasSession: !!session,
      userId: session?.user?.id
    });

    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      try {
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
        
        if (!userProfile) {
          console.warn('[AUTH] Usuário sem perfil, mas continuando autenticado');
        }
      } catch (error) {
        console.error('[AUTH] Erro ao processar perfil do usuário:', error);
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
  };

  // Inicialização da autenticação com circuit breaker aprimorado
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log(`[AUTH] Inicializando autenticação (tentativa ${initializationAttempts + 1}/${maxRetries})`);
        
        // Configurar listener de mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            console.log('[AUTH] Evento de auth:', event);
            await processAuthChange(session);
          }
        );

        // Verificar sessão existente
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AUTH] Erro ao obter sessão:', error);
          setAuthError(error);
          if (initializationAttempts < maxRetries - 1) {
            setInitializationAttempts(prev => prev + 1);
            return; // Tentar novamente
          }
        } else {
          await processAuthChange(session);
          setAuthError(null);
        }

        setIsLoading(false);

        return () => {
          subscription.unsubscribe();
          mounted = false;
        };

      } catch (error: any) {
        console.error('[AUTH] Erro crítico na inicialização:', error);
        setAuthError(error);
        
        if (initializationAttempts < maxRetries - 1) {
          setInitializationAttempts(prev => prev + 1);
          setTimeout(() => {
            if (mounted) initializeAuth();
          }, 1000 * (initializationAttempts + 1)); // Backoff exponencial
        } else {
          setIsLoading(false);
          toast({
            title: 'Erro de inicialização',
            description: 'Não foi possível inicializar a autenticação. Recarregue a página.',
            variant: 'destructive',
          });
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [initializationAttempts]);

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AUTH] Erro no login:', error);
        return { error };
      }

      console.log('[AUTH] Login realizado com sucesso');
      return { error: null };
    } catch (error: any) {
      console.error('[AUTH] Erro crítico no login:', error);
      return { error };
    }
  };

  // Função de logout com tratamento robusto
  const signOut = async () => {
    try {
      console.log('[AUTH] Iniciando logout...');
      await signOutUser();
      return { success: true, error: null };
    } catch (error: any) {
      console.error('[AUTH] Erro no logout:', error);
      return { success: false, error };
    }
  };

  // Funções específicas (mantidas para compatibilidade)
  const signInAsMember = signIn;
  const signInAsAdmin = signIn;

  // Derivar propriedades baseadas no profile
  const isAdmin = profile?.user_roles?.name === 'admin' || false;
  const isFormacao = profile?.user_roles?.name === 'formacao' || false;

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
    setUser,
    setSession,
    setProfile,
    setIsLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
