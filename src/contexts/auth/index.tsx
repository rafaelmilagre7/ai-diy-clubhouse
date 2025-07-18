
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName, isAdminRole, isFormacaoRole } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({
    setIsLoading,
  });

  // TIMEOUT OBRIGATÓRIO - 3 segundos (mais realista)
  useEffect(() => {
    console.log("🔐 [AUTH] Configurando timeout obrigatório de 3 segundos");
    const emergencyTimeout = setTimeout(() => {
      console.error("🚨 [AUTH-PROVIDER] TIMEOUT OBRIGATÓRIO - Forçando parada do loading");
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(emergencyTimeout);
  }, []);

  // Computar isAdmin APENAS via role
  const isAdmin = React.useMemo(() => {
    return isAdminRole(profile);
  }, [profile]);

  // Computar isFormacao
  const isFormacao = React.useMemo(() => {
    return isFormacaoRole(profile);
  }, [profile]);

  // Computar hasCompletedOnboarding
  const hasCompletedOnboarding = React.useMemo(() => {
    return Boolean(profile?.onboarding_completed);
  }, [profile]);

  // INICIALIZAÇÃO SUPER SIMPLIFICADA - SEM DEPENDÊNCIAS CIRCULARES
  useEffect(() => {
    console.log('🚀 [AUTH] INICIALIZAÇÃO SUPER SIMPLIFICADA - SEM useSessionManager');
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔐 [AUTH] Sessão obtida:', { hasSession: !!session });
        
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          
          // Buscar perfil de forma simples
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select(`
                *,
                user_roles (
                  id,
                  name,
                  description,
                  permissions
                )
              `)
              .eq('id', session.user.id)
              .single();

            if (profileData) {
              setProfile(profileData as UserProfile);
            }
          } catch (profileError) {
            console.warn('⚠️ [AUTH] Erro ao buscar perfil:', profileError);
          }
        }
        
        setIsLoading(false);
        
      } catch (error) {
        console.error('❌ [AUTH] Erro:', error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    session,
    profile,
    isAdmin,
    isFormacao,
    hasCompletedOnboarding,
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
