import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName, isAdminRole, isFormacaoRole } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { useAuthStateManager } from './hooks/useAuthStateManager';
import { clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { AuthContextType } from './types';
import { useSessionManager } from '@/hooks/security/useSessionManager';

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
  
  const authListenerRef = useRef<any>(null);
  const isInitialized = useRef(false);
  const lastUserId = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar useAuthStateManager com os setters como parâmetros
  const { setupAuthSession } = useAuthStateManager({
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  });

  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({
    setIsLoading,
  });

  // Initialize session manager
  useSessionManager();

  // TIMEOUT ABSOLUTO AGRESSIVO - 2 segundos
  useEffect(() => {
    console.log("🔐 [AUTH] Configurando timeout absoluto de 2s");
    const timeout = setTimeout(() => {
      console.warn("⚠️ [AUTH] TIMEOUT ABSOLUTO - Parando loading");
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Computar isAdmin APENAS via role - sem hardcoded emails
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

  // INICIALIZAÇÃO SUPER SIMPLIFICADA - APENAS O ESSENCIAL
  useEffect(() => {
    if (isInitialized.current) return;
    console.log('🚀 [AUTH] INICIALIZAÇÃO SUPER SIMPLIFICADA');
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔐 [AUTH] Sessão obtida:', { hasSession: !!session });
        
        if (session?.user) {
          setUser(session.user);
          setSession(session);
        }
        
        // PARAR LOADING IMEDIATAMENTE
        setIsLoading(false);
        
      } catch (error) {
        console.error('❌ [AUTH] Erro:', error);
        setIsLoading(false);
      }
    };

    initAuth();
    isInitialized.current = true;
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