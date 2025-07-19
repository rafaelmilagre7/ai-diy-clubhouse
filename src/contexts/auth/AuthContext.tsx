import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profileLoadAttempts, setProfileLoadAttempts] = useState(0);

  // Estados derivados para roles
  const isAdmin = Boolean(
    profile?.user_roles?.name === 'admin' || 
    profile?.email?.endsWith('@viverdeia.ai')
  );
  
  const isFormacao = Boolean(
    profile?.user_roles?.name === 'formacao' || isAdmin
  );

  // Função para buscar perfil com retry e timeout otimizado
  const fetchUserProfile = async (userId: string, retryCount = 0): Promise<UserProfile | null> => {
    const maxRetries = 2; // Reduzido para 2 tentativas
    const timeoutMs = 3000; // Reduzido para 3 segundos

    try {
      console.log(`[AUTH] Buscando perfil (tentativa ${retryCount + 1}/${maxRetries + 1})...`);
      
      // Usar fetchUserProfileSecurely que tem cache e é mais robusto
      const { fetchUserProfileSecurely } = await import('./utils/authSessionUtils');
      const profile = await Promise.race([
        fetchUserProfileSecurely(userId),
        new Promise<null>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout ao buscar perfil')), timeoutMs);
        })
      ]);

      if (!profile) {
        console.warn(`[AUTH] Perfil não encontrado para usuário: ${userId}`);
        
        // Se não encontrou perfil e ainda temos retries, tentar novamente
        if (retryCount < maxRetries) {
          console.log(`[AUTH] Tentando novamente em 1 segundo...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchUserProfile(userId, retryCount + 1);
        }
        
        return null;
      }

      console.log(`[AUTH] Perfil carregado com sucesso:`, {
        name: profile.name,
        email: profile.email,
        role: profile.user_roles?.name || 'sem role'
      });

      return profile;

    } catch (error) {
      console.error(`[AUTH] Erro na tentativa ${retryCount + 1}:`, error);
      
      // Se ainda temos retries disponíveis, tentar novamente
      if (retryCount < maxRetries) {
        console.log(`[AUTH] Tentando novamente em 1 segundo...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchUserProfile(userId, retryCount + 1);
      }
      
      // Esgotar tentativas - retornar null em vez de quebrar
      console.error(`[AUTH] Todas as tentativas falharam para usuário ${userId}`);
      return null;
    }
  };

  // Função para verificar se é admin
  const checkIsAdmin = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_user_admin_fast', {
        target_user_id: userId
      });

      if (error) {
        console.error('[AUTH] Erro ao verificar admin:', error);
        return false;
      }

      return Boolean(data);
    } catch (error) {
      console.error('[AUTH] Erro crítico ao verificar admin:', error);
      return false;
    }
  };

  // Configurar listener de autenticação
  useEffect(() => {
    console.log('[AUTH] Configurando listener de autenticação...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[AUTH] Evento: ${event}`, {
          hasSession: !!session,
          hasUser: !!session?.user
        });

        setSession(session);
        setUser(session?.user ?? null);
        setAuthError(null);

        if (event === 'SIGNED_IN' && session?.user) {
          // Usuário logado - buscar perfil com fallback
          setIsLoading(true);
          setProfileLoadAttempts(prev => prev + 1);
          
          try {
            const userProfile = await fetchUserProfile(session.user.id);
            if (userProfile) {
              setProfile(userProfile);
            } else {
              // Fallback: Criar perfil básico se não conseguir carregar
              console.warn('[AUTH] Criando perfil básico como fallback');
              const basicProfile = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || 'Usuário',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_roles: { name: 'member' }
              };
              setProfile(basicProfile as any);
            }
          } catch (error) {
            console.error('[AUTH] Erro crítico ao buscar perfil, usando fallback:', error);
            // Criar perfil de emergência para não quebrar a aplicação
            const emergencyProfile = {
              id: session.user.id,
              email: session.user.email || '',
              name: 'Usuário',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_roles: { name: 'member' }
            };
            setProfile(emergencyProfile as any);
          }
          setIsLoading(false);
          
        } else if (event === 'SIGNED_OUT') {
          // Usuário deslogado - limpar tudo
          setProfile(null);
          setIsLoading(false);
          setProfileLoadAttempts(0);
        }
      }
    );

    // Verificar sessão existente
    const initializeAuth = async () => {
      try {
        console.log('[AUTH] Verificando sessão existente...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AUTH] Erro ao obter sessão:', error);
          setAuthError(error.message);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('[AUTH] Sessão existente encontrada');
          setSession(session);
          setUser(session.user);
          
          // Buscar perfil para sessão existente com fallback
          try {
            const userProfile = await fetchUserProfile(session.user.id);
            if (userProfile) {
              setProfile(userProfile);
            } else {
              // Fallback básico
              const basicProfile = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || 'Usuário',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_roles: { name: 'member' }
              };
              setProfile(basicProfile as any);
            }
          } catch (error) {
            console.error('[AUTH] Erro ao buscar perfil na inicialização, usando fallback');
            const emergencyProfile = {
              id: session.user.id,
              email: session.user.email || '',
              name: 'Usuário',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_roles: { name: 'member' }
            };
            setProfile(emergencyProfile as any);
          }
        } else {
          console.log('[AUTH] Nenhuma sessão existente');
        }
      } catch (error) {
        console.error('[AUTH] Erro na inicialização:', error);
        setAuthError('Erro ao inicializar autenticação');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AUTH] Tentando fazer login...');
      setIsLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AUTH] Erro no login:', error);
        setAuthError(error.message);
        return { data: null, error };
      }

      console.log('[AUTH] Login realizado com sucesso');
      return { data, error: null };
    } catch (error: any) {
      console.error('[AUTH] Erro crítico no login:', error);
      setAuthError(error.message || 'Erro desconhecido no login');
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const signOut = async (): Promise<void> => {
    try {
      console.log('[AUTH] Fazendo logout...');
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AUTH] Erro no logout:', error);
        throw error;
      }
      
      console.log('[AUTH] Logout realizado com sucesso');
      
      // Limpar estados
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthError(null);
      setProfileLoadAttempts(0);
      
    } catch (error: any) {
      console.error('[AUTH] Erro crítico no logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsMember = async (email: string, password: string) => {
    try {
      console.log('[AUTH] Tentando fazer login como membro...');
      setIsLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AUTH] Erro no login como membro:', error);
        setAuthError(error.message);
        return { data: null, error };
      }

      console.log('[AUTH] Login como membro realizado com sucesso');
      return { data, error: null };
    } catch (error: any) {
      console.error('[AUTH] Erro crítico no login como membro:', error);
      setAuthError(error.message || 'Erro desconhecido no login como membro');
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsAdmin = async (email: string, password: string) => {
    try {
      console.log('[AUTH] Tentando fazer login como admin...');
      setIsLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AUTH] Erro no login como admin:', error);
        setAuthError(error.message);
        return { data: null, error };
      }

      console.log('[AUTH] Login como admin realizado com sucesso');
      return { data, error: null };
    } catch (error: any) {
      console.error('[AUTH] Erro crítico no login como admin:', error);
      setAuthError(error.message || 'Erro desconhecido no login como admin');
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
