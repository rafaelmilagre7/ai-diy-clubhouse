
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { profileFetcher } from '@/lib/auth/profileFetcher';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados derivados memoizados para evitar re-renders
  const isAdmin = React.useMemo(() => 
    profile?.user_roles?.name === 'admin' || profile?.email?.includes('@viverdeia.ai') || false, 
    [profile?.user_roles?.name, profile?.email]
  );
  const isFormacao = React.useMemo(() => 
    profile?.user_roles?.name === 'formacao' || false, 
    [profile?.user_roles?.name]
  );

  // Flag para evitar fetches múltiplos
  const fetchingProfile = React.useRef(false);
  
  const fetchProfile = React.useCallback(async (userId: string): Promise<void> => {
    // Evitar múltiplos fetches simultâneos
    if (fetchingProfile.current) return;
    
    try {
      fetchingProfile.current = true;
      console.log('🔄 [AUTH] Buscando perfil para:', userId);
      
      const fetchedProfile = await profileFetcher.fetchProfile(userId);
      
      if (fetchedProfile) {
        console.log('✅ [AUTH] Perfil carregado:', {
          name: fetchedProfile.name,
          email: fetchedProfile.email,
          role: fetchedProfile.user_roles?.name || 'N/A'
        });
        
        setProfile(fetchedProfile);
      } else {
        console.warn('⚠️ [AUTH] Perfil não encontrado');
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ [AUTH] Erro ao buscar perfil:', error);
      setProfile(null);
    } finally {
      fetchingProfile.current = false;
    }
  }, []);

  // Setup inicial da autenticação simplificado
  useEffect(() => {
    console.log('🚀 [AUTH] Inicializando AuthContext');
    
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;
    
    const initAuth = async () => {
      try {
        // 1. Configurar listener simplificado (sem async na callback)
        const { data } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            if (!mounted) return;
            
            console.log(`🔄 [AUTH] Evento: ${event}`, {
              hasSession: !!newSession,
              hasUser: !!newSession?.user
            });
            
            // Atualizações síncronas
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            // Fetch de perfil diferido para evitar deadlocks
            if (newSession?.user && event === 'SIGNED_IN') {
              setTimeout(() => {
                if (mounted) {
                  fetchProfile(newSession.user.id);
                }
              }, 100);
            } else if (!newSession?.user) {
              setProfile(null);
            }
            
            // Finalizar loading
            if (mounted) {
              setIsLoading(false);
            }
          }
        );
        
        subscription = data.subscription;

        // 2. Verificar sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted && currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Fetch diferido do perfil
          setTimeout(() => {
            if (mounted) {
              fetchProfile(currentSession.user.id);
            }
          }, 100);
        }
        
        // 3. Timeout de segurança reduzido
        setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
          }
        }, 4000); // 4 segundos máximo
        
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();
    
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // Função para refetch de perfil
  const refetchProfile = async (): Promise<void> => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  // Função de login
  const signIn = async (email: string, password: string): Promise<{ error?: any }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Função de logout
  const signOut = async (): Promise<void> => {
    try {
      console.log('🚪 [AUTH] Fazendo logout');
      
      // Limpar cache
      profileFetcher.clearCache();
      
      // Logout do Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Limpar estado local
      setSession(null);
      setUser(null);
      setProfile(null);
      
      // Redirecionar
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ [AUTH] Erro no logout:', error);
      // Forçar limpeza mesmo com erro
      window.location.href = '/login';
    }
  };

  const contextValue: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    isAdmin,
    isFormacao,
    refetchProfile,
    signOut,
    signIn,
    setProfile
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
