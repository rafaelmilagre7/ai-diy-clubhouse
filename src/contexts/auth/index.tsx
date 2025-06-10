import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName, isAdminRole, isFormacaoRole } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { useAuthStateManager } from './hooks/useAuthStateManager';
import { clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { AuthContextType } from './types';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

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

  // Usar o sistema global de loading
  const { 
    setLoading: setGlobalLoading, 
    forceComplete, 
    circuitBreakerActive,
    isAnyLoading 
  } = useGlobalLoading({
    timeout: 4000,
    enableCircuitBreaker: true,
    retryAttempts: 1
  });

  // Inicializar useAuthStateManager com os setters
  const { setupAuthSession } = useAuthStateManager({
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  });

  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({
    setIsLoading,
  });

  // Circuit breaker global - timeout unificado
  useEffect(() => {
    if (circuitBreakerActive && isLoading) {
      console.warn("⚠️ [AUTH] Circuit breaker global ativo - finalizando loading");
      setIsLoading(false);
    }
  }, [circuitBreakerActive, isLoading]);

  // Verificação imediata de admin baseada em email
  const isAdminByEmail = user?.email && [
    'rafael@viverdeia.ai',
    'admin@viverdeia.ai',
    'admin@teste.com'
  ].includes(user.email.toLowerCase());

  // Computar isAdmin com cache
  const isAdmin = React.useMemo(() => {
    return isAdminRole(profile) || isAdminByEmail;
  }, [profile, isAdminByEmail]);

  // Computar isFormacao
  const isFormacao = React.useMemo(() => {
    return isFormacaoRole(profile);
  }, [profile]);

  // Inicialização única otimizada
  useEffect(() => {
    if (isInitialized.current) return;
    
    const initializeAuth = async () => {
      console.log('🚀 [AUTH] Inicializando sistema com timeout unificado');
      setGlobalLoading('auth', true);
      
      try {
        await setupAuthSession();
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log(`🔄 [AUTH] Evento: ${event}`);
            
            const currentUserId = session?.user?.id;
            if (lastUserId.current && lastUserId.current !== currentUserId) {
              console.log('👤 [AUTH] Mudança de usuário - limpando cache');
              clearProfileCache();
            }
            lastUserId.current = currentUserId;
            
            if (event === 'SIGNED_IN' && session?.user) {
              console.log(`🎉 [AUTH] Login: ${session.user.email}`);
              
              try {
                if (!circuitBreakerActive) {
                  await setupAuthSession();
                } else {
                  console.warn('[AUTH] Circuit breaker ativo - setup simplificado');
                  setUser(session.user);
                  setSession(session);
                  setIsLoading(false);
                }
              } catch (error) {
                console.error('❌ [AUTH] Erro no setup pós-login:', error);
                setAuthError(error instanceof Error ? error : new Error('Erro no setup'));
                setUser(session.user);
                setSession(session);
                setIsLoading(false);
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('👋 [AUTH] Logout');
              clearProfileCache();
              setUser(null);
              setProfile(null);
              setSession(null);
              setAuthError(null);
              setIsLoading(false);
              setGlobalLoading('auth', false);
            }
          }
        );
        
        authListenerRef.current = subscription;
        isInitialized.current = true;
        console.log('✅ [AUTH] Inicialização concluída');
        
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização:', error);
        setAuthError(error instanceof Error ? error : new Error('Erro na inicialização'));
      } finally {
        setIsLoading(false);
        setGlobalLoading('auth', false);
      }
    };

    initializeAuth();

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
    };
  }, [setupAuthSession, setGlobalLoading, circuitBreakerActive]);

  const value: AuthContextType = {
    user,
    session,
    profile,
    isAdmin,
    isFormacao,
    isLoading: isLoading && !circuitBreakerActive,
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
