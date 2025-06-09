
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthStateManager, AuthState } from './managers/AuthStateManager';
import { AuthContextType } from './types';
import { SecurityProvider } from './SecurityContext';
import { SecurityMonitor } from '@/components/security/SecurityMonitor';
import { logger } from '@/utils/logger';

// Criação do contexto com valor padrão undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado unificado de autenticação
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    isAdmin: false,
    isFormacao: false,
    isLoading: true,
    authError: null
  });
  
  // Extrair valores do estado para facilitar o acesso
  const { session, user, profile, isAdmin, isFormacao, isLoading, authError } = authState;
  
  // Métodos de atualização otimizados com useCallback
  const setSession = useCallback((value: React.SetStateAction<Session | null>) => {
    setAuthState(prev => ({
      ...prev,
      session: typeof value === 'function' ? value(prev.session) : value
    }));
  }, []);
  
  const setUser = useCallback((value: React.SetStateAction<User | null>) => {
    setAuthState(prev => ({
      ...prev,
      user: typeof value === 'function' ? value(prev.user) : value
    }));
  }, []);
  
  const setProfile = useCallback((value: React.SetStateAction<UserProfile | null>) => {
    setAuthState(prev => ({
      ...prev,
      profile: typeof value === 'function' ? value(prev.profile) : value,
      isAdmin: typeof value === 'function' 
        ? (value(prev.profile)?.role === 'admin')
        : (value?.role === 'admin'),
      isFormacao: typeof value === 'function'
        ? (value(prev.profile)?.role === 'formacao')
        : (value?.role === 'formacao')
    }));
  }, []);
  
  const setIsLoading = useCallback((value: React.SetStateAction<boolean>) => {
    setAuthState(prev => ({
      ...prev,
      isLoading: typeof value === 'function' ? value(prev.isLoading) : value
    }));
  }, []);

  // Handler otimizado para atualização de estado do AuthStateManager
  const handleAuthStateChange = useCallback((newState: Partial<AuthState>) => {
    setAuthState(prev => ({
      ...prev,
      ...newState
    }));
  }, []);
  
  // Extrair métodos de autenticação com rate limiting integrado
  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({ setIsLoading });
  
  // Salvar a rota autenticada quando o usuário fizer login com sucesso
  useEffect(() => {
    if (user && profile && !isLoading) {
      localStorage.setItem('lastAuthRoute', window.location.pathname);
    }
  }, [user, profile, isLoading]);

  // Handler de eventos de segurança
  const handleSecurityEvent = useCallback((event: string, details: any) => {
    logger.warn(`Evento de segurança: ${event}`, {
      component: 'AUTH_PROVIDER',
      event,
      details,
      userId: user?.id?.substring(0, 8) + '***' || 'anonymous'
    });
    
    // Eventos críticos que requerem ação imediata
    const criticalEvents = ['suspicious_scripts', 'console_access', 'devtools_detected'];
    if (criticalEvents.includes(event)) {
      // Log crítico e possível logout em casos extremos
      if (event === 'suspicious_scripts') {
        logger.error("Scripts maliciosos detectados, considerando logout", {
          component: 'AUTH_PROVIDER'
        });
      }
    }
  }, [user]);

  // Montar objeto de contexto memoizado
  const contextValue: AuthContextType = React.useMemo(() => ({
    session,
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    authError,
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  }), [
    session, user, profile, isAdmin, isFormacao, isLoading, authError,
    signIn, signOut, signInAsMember, signInAsAdmin,
    setSession, setUser, setProfile, setIsLoading
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      <SecurityProvider>
        <SecurityMonitor onSecurityEvent={handleSecurityEvent} />
        <AuthStateManager onStateChange={handleAuthStateChange} />
        {children}
      </SecurityProvider>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};
