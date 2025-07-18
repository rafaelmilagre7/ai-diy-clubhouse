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

  // Circuit breaker sincronizado - timeout de 7 segundos
  useEffect(() => {
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        console.warn("⚠️ [AUTH] Timeout ativado - finalizando loading");
        setIsLoading(false);
      }, 7000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading]);

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

  // Inicialização simplificada - uma única vez
  useEffect(() => {
    if (isInitialized.current) return;
    
    const initializeAuth = async () => {
      console.log('🚀 [AUTH] Inicializando autenticação');
      
      try {
        // Configurar listener primeiro
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log(`🔄 [AUTH] Evento: ${event}`);
            
            // Limpar cache se mudou usuário
            const currentUserId = session?.user?.id;
            if (lastUserId.current && lastUserId.current !== currentUserId) {
              clearProfileCache();
            }
            lastUserId.current = currentUserId;
            
            if (event === 'SIGNED_IN' && session?.user) {
              console.log(`✅ [AUTH] Login: ${session.user.email}`);
              // Usar timeout para evitar deadlock
              setTimeout(() => {
                setupAuthSession().catch(error => {
                  console.error('❌ [AUTH] Erro no setup:', error);
                  setAuthError(error instanceof Error ? error : new Error('Erro no setup'));
                  setIsLoading(false);
                });
              }, 100);
            } else if (event === 'SIGNED_OUT') {
              console.log('👋 [AUTH] Logout');
              clearProfileCache();
              setUser(null);
              setProfile(null);
              setSession(null);
              setAuthError(null);
              setIsLoading(false);
            }
          }
        );
        
        authListenerRef.current = subscription;
        
        // Setup inicial
        await setupAuthSession();
        isInitialized.current = true;
        
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização:', error);
        setAuthError(error instanceof Error ? error : new Error('Erro na inicialização'));
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [setupAuthSession]);

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