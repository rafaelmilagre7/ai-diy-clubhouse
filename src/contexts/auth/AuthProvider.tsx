
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthStateManager, AuthState } from './managers/AuthStateManager';
import { AuthContextType } from './types';
import { SecurityProvider } from '@/components/security/SecurityProvider';
import { SecurityMonitor } from '@/components/security/SecurityMonitor';
import { logger } from '@/utils/logger';
import { auditLogger } from '@/utils/auditLogger';

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
  
  // Log de eventos de autenticação para auditoria (simplificado)
  useEffect(() => {
    const logAuthEvents = async () => {
      if (user && profile && !isLoading) {
        try {
          // Log de sessão ativa apenas se necessário
          await auditLogger.logAuthEvent('session_active', {
            userRole: profile.role,
            timestamp: new Date().toISOString()
          }, user.id);
          
          logger.info("Sessão de usuário ativa", {
            component: 'AUTH_PROVIDER',
            userId: user.id.substring(0, 8) + '***',
            role: profile.role
          });
        } catch (error) {
          // Falhar silenciosamente para não quebrar o fluxo
          logger.debug("Erro no log de autenticação", {
            component: 'AUTH_PROVIDER',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }
    };
    
    // Debounce para evitar múltiplas chamadas
    const timeoutId = setTimeout(logAuthEvents, 1000);
    return () => clearTimeout(timeoutId);
  }, [user, profile, isLoading]);

  // Handler de eventos de segurança simplificado
  const handleSecurityEvent = useCallback(async (event: string, details: any) => {
    try {
      logger.warn(`Evento de segurança: ${event}`, {
        component: 'AUTH_PROVIDER',
        event,
        details: typeof details === 'object' ? details : { raw: details },
        userId: user?.id?.substring(0, 8) + '***' || 'anonymous'
      });
      
      // Log apenas eventos críticos
      const criticalEvents = ['script_injection_detected', 'suspicious_scripts'];
      if (criticalEvents.includes(event)) {
        await auditLogger.logSecurityEvent(event, 'high', {
          ...details,
          context: 'auth_provider'
        });
      }
      
    } catch (error) {
      // Falhar silenciosamente
      logger.debug("Erro ao processar evento de segurança", {
        component: 'AUTH_PROVIDER',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
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
