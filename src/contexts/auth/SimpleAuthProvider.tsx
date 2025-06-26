
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
    
    logger.info('[SIMPLE-AUTH-PROVIDER] 🔄 Inicializando com AuthManager');
    
    // Subscribe to state changes
    const unsubscribe = authManager.on('stateChanged', (newState) => {
      logger.info('[SIMPLE-AUTH-PROVIDER] 📡 Estado atualizado:', {
        hasUser: !!newState.user,
        isLoading: newState.isLoading,
        isAdmin: newState.isAdmin
      });
      setAuthState(newState);
    });
    
    // Initialize if not already initialized
    if (!authManager.isInitialized()) {
      authManager.initialize().catch(error => {
        logger.error('[SIMPLE-AUTH-PROVIDER] Erro na inicialização:', error);
      });
    } else {
      // If already initialized, update to current state
      setAuthState(authManager.getState());
    }
    
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
