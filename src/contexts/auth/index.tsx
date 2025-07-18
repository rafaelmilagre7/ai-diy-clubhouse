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

  // Circuit breaker sincronizado - timeout de 6 segundos (SINCRONIZADO)
  useEffect(() => {
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        console.warn("⚠️ [AUTH] Timeout ativado - finalizando loading");
        setIsLoading(false);
      }, 6000); // REDUZIDO PARA 6s - SINCRONIZADO
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

  // INICIALIZAÇÃO ULTRA SIMPLIFICADA - QUEBRAR LOOP
  useEffect(() => {
    if (isInitialized.current) return;
    console.log('🚀 [AUTH] INICIALIZAÇÃO SIMPLIFICADA para quebrar loop');
    
    const initializeAuth = async () => {
      try {
        // VERIFICAÇÃO RÁPIDA: Apenas obter sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('✅ [AUTH] Sessão ativa - configurando...');
          setUser(session.user);
          setSession(session);
          // Carregar perfil em background para não bloquear
          setTimeout(() => {
            setupAuthSession().catch(() => {
              console.warn('⚠️ [AUTH] Erro ao carregar perfil - continuando...');
              setIsLoading(false);
            });
          }, 0);
        } else {
          console.log('🔓 [AUTH] SEM SESSÃO - PARANDO loading IMEDIATAMENTE');
          setUser(null);
          setProfile(null);
          setSession(null);
          setIsLoading(false); // PARAR LOADING IMEDIATAMENTE
        }

        // Listener simplificado
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log(`🔄 [AUTH] Evento: ${event}, tem sessão: ${!!session}`);
            
            if (event === 'SIGNED_IN' && session?.user) {
              setUser(session.user);
              setSession(session);
              setTimeout(() => setupAuthSession(), 0);
            } else if (event === 'SIGNED_OUT') {
              clearProfileCache();
              setUser(null);
              setProfile(null);
              setSession(null);
              setAuthError(null);
              setIsLoading(false);
            } else if (!session) {
              // SEM SESSÃO = PARAR LOADING
              console.log('🔓 [AUTH] Sem sessão - PARANDO loading');
              setUser(null);
              setProfile(null);
              setSession(null);
              setIsLoading(false);
            }
          }
        );
        
        authListenerRef.current = subscription;
        isInitialized.current = true;
        
      } catch (error) {
        console.error('❌ [AUTH] Erro crítico - PARANDO loading:', error);
        setAuthError(error instanceof Error ? error : new Error('Erro crítico'));
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