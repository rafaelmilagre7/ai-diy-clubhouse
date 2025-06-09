
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
import { securityHeaders } from '@/utils/securityHeaders';

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
  
  // Log de eventos de autenticação para auditoria
  useEffect(() => {
    const logAuthEvents = async () => {
      if (user && profile && !isLoading) {
        // Log de sessão ativa
        await auditLogger.logAuthEvent('session_active', {
          userRole: profile.role,
          isAdmin,
          isFormacao,
          timestamp: new Date().toISOString()
        }, user.id);
        
        // Salvar a rota autenticada
        localStorage.setItem('lastAuthRoute', window.location.pathname);
        
        logger.info("Sessão de usuário ativa com auditoria", {
          component: 'AUTH_PROVIDER',
          userId: user.id.substring(0, 8) + '***',
          role: profile.role
        });
      }
    };
    
    logAuthEvents();
  }, [user, profile, isLoading, isAdmin, isFormacao]);

  // Handler de eventos de segurança aprimorado
  const handleSecurityEvent = useCallback(async (event: string, details: any) => {
    try {
      // Log estruturado do evento
      logger.warn(`Evento de segurança detectado: ${event}`, {
        component: 'AUTH_PROVIDER',
        event,
        details: typeof details === 'object' ? details : { raw: details },
        userId: user?.id?.substring(0, 8) + '***' || 'anonymous',
        timestamp: new Date().toISOString()
      });
      
      // Auditoria do evento de segurança
      await auditLogger.logSecurityEvent(event, 'medium', {
        ...details,
        context: 'auth_provider',
        userAgent: navigator.userAgent.substring(0, 100),
        url: window.location.pathname
      });
      
      // Eventos críticos que requerem ação imediata
      const criticalEvents = ['suspicious_scripts', 'script_injection_detected', 'excessive_dom_mutations'];
      if (criticalEvents.includes(event)) {
        logger.error("Evento crítico de segurança detectado", {
          component: 'AUTH_PROVIDER',
          event,
          details
        });
        
        // Log crítico para análise posterior
        await auditLogger.logSecurityEvent(`critical_${event}`, 'critical', {
          ...details,
          action_taken: 'logged_for_analysis',
          requires_review: true
        });
      }
      
      // Eventos que podem indicar tentativa de manipulação
      const manipulationEvents = ['console_access', 'devtools_detected'];
      if (manipulationEvents.includes(event) && process.env.NODE_ENV === 'production') {
        await auditLogger.logSecurityEvent('potential_manipulation', 'high', {
          original_event: event,
          ...details,
          production_environment: true
        });
      }
      
    } catch (error) {
      logger.error("Erro ao processar evento de segurança", {
        component: 'AUTH_PROVIDER',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        originalEvent: event
      });
    }
  }, [user]);

  // Verificar ambiente seguro na inicialização
  useEffect(() => {
    const checkSecureEnvironment = async () => {
      const isSecure = securityHeaders.validateOrigin(window.location.origin);
      const protocol = window.location.protocol;
      
      if (!isSecure || (process.env.NODE_ENV === 'production' && protocol !== 'https:')) {
        await auditLogger.logSecurityEvent('insecure_environment', 'high', {
          origin: window.location.origin,
          protocol,
          environment: process.env.NODE_ENV
        });
        
        logger.warn("Ambiente inseguro detectado", {
          component: 'AUTH_PROVIDER',
          origin: window.location.origin,
          protocol
        });
      } else {
        logger.info("Ambiente seguro verificado", {
          component: 'AUTH_PROVIDER',
          protocol,
          environment: process.env.NODE_ENV
        });
      }
    };
    
    checkSecureEnvironment();
  }, []);

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
