
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import AuthManager from '@/services/AuthManager';
import { AuthState } from '@/types/authTypes';

interface SimpleAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFormacao: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error | null }>;
  signOut: () => Promise<{ success: boolean; error?: Error | null }>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

interface SimpleAuthProviderProps {
  children: ReactNode;
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => AuthManager.getInstance().getState());
  
  useEffect(() => {
    const authManager = AuthManager.getInstance();
    
    logger.info('[SIMPLE-AUTH-PROVIDER] 🔄 Inicializando com AuthManager CORRIGIDO', {
      component: 'SimpleAuthProvider',
      action: 'initialize'
    });
    
    // Subscribe to state changes
    const unsubscribe = authManager.on('stateChanged', (newState) => {
      logger.info('[SIMPLE-AUTH-PROVIDER] 📡 Estado atualizado via AuthManager', {
        component: 'SimpleAuthProvider',
        action: 'state_changed',
        hasUser: !!newState.user,
        isLoading: newState.isLoading,
        isAdmin: newState.isAdmin,
        error: newState.error,
        timestamp: new Date().toISOString()
      });
      setAuthState(newState);
    });
    
    // Initialize AuthManager
    const initializeAuth = async () => {
      try {
        logger.info('[SIMPLE-AUTH-PROVIDER] 🚀 Forçando inicialização do AuthManager', {
          component: 'SimpleAuthProvider',
          action: 'force_initialize'
        });
        await authManager.initialize();
        
        // Atualizar estado após inicialização
        const currentState = authManager.getState();
        logger.info('[SIMPLE-AUTH-PROVIDER] ✅ AuthManager inicializado', {
          component: 'SimpleAuthProvider',
          action: 'initialize_complete',
          hasUser: !!currentState.user,
          isLoading: currentState.isLoading,
          isAdmin: currentState.isAdmin
        });
        setAuthState(currentState);
        
      } catch (error) {
        logger.error('[SIMPLE-AUTH-PROVIDER] ❌ Erro na inicialização', error, {
          component: 'SimpleAuthProvider',
          action: 'initialize_error'
        });
        // Garantir que loading seja resetado mesmo em erro
        setAuthState(prev => ({ ...prev, isLoading: false, error: (error as Error).message }));
      }
    };

    // Inicializar imediatamente
    initializeAuth();
    
    return unsubscribe;
  }, []);

  const contextValue: SimpleAuthContextType = {
    user: authState.user,
    session: authState.session,
    profile: authState.profile,
    isLoading: authState.isLoading,
    error: authState.error,
    isAdmin: authState.isAdmin,
    isFormacao: authState.isFormacao,
    signIn: AuthManager.getInstance().signIn.bind(AuthManager.getInstance()),
    signOut: AuthManager.getInstance().signOut.bind(AuthManager.getInstance())
  };

  logger.info('[SIMPLE-AUTH-PROVIDER] 📊 Renderizando com estado', {
    component: 'SimpleAuthProvider',
    action: 'render',
    isLoading: authState.isLoading,
    hasUser: !!authState.user,
    hasProfile: !!authState.profile,
    error: authState.error
  });

  return (
    <SimpleAuthContext.Provider value={contextValue}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = (): SimpleAuthContextType => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

// ALIAS TEMPORÁRIO PARA COMPATIBILIDADE
export const useAuth = useSimpleAuth;
