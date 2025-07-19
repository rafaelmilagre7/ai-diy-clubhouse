
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

  // Estados derivados
  const isAdmin = profile?.user_roles?.name === 'admin' || profile?.email?.includes('@viverdeia.ai') || false;
  const isFormacao = profile?.user_roles?.name === 'formacao' || false;

  // Função para buscar perfil
  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      console.log(`🔄 [AUTH] Buscando perfil para: ${userId}`);
      
      const fetchedProfile = await profileFetcher.fetchProfile(userId);
      
      if (fetchedProfile) {
        console.log(`✅ [AUTH] Perfil carregado:`, {
          name: fetchedProfile.name,
          email: fetchedProfile.email,
          role: fetchedProfile.user_roles?.name || 'sem role'
        });
        setProfile(fetchedProfile);
      } else {
        console.warn('⚠️ [AUTH] Perfil não encontrado');
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ [AUTH] Erro ao buscar perfil:', error);
      setProfile(null);
    }
  };

  // Setup inicial da autenticação
  useEffect(() => {
    console.log('🚀 [AUTH] Inicializando AuthContext');
    
    let mounted = true;
    
    const initAuth = async () => {
      try {
        // 1. Configurar listener de auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!mounted) return;
            
            console.log(`🔄 [AUTH] Evento: ${event}`, {
              hasSession: !!newSession,
              hasUser: !!newSession?.user
            });
            
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            // Buscar perfil se há usuário
            if (newSession?.user) {
              await fetchProfile(newSession.user.id);
            } else {
              setProfile(null);
            }
            
            if (mounted) {
              setIsLoading(false);
            }
          }
        );

        // 2. Verificar sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted && currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchProfile(currentSession.user.id);
        }
        
        // 3. Finalizar loading após timeout máximo
        setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
          }
        }, 8000); // 8 segundos máximo
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const cleanup = initAuth();
    
    return () => {
      mounted = false;
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []);

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
