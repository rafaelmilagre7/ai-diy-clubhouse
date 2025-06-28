
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import AuthManager from '@/services/AuthManager';
import { EmergencyReset } from '@/services/EmergencyReset';

interface SimpleAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFormacao: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: Error | null }>;
  signOut: () => Promise<{ success: boolean; error?: Error | null }>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

interface SimpleAuthProviderProps {
  children: ReactNode;
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const authManager = AuthManager.getInstance();
    return authManager.getState();
  });
  
  useEffect(() => {
    const authManager = AuthManager.getInstance();
    
    logger.info('[SIMPLE-AUTH-PROVIDER] Inicializando com AuthManager otimizado');
    
    // Limpar estado de emergência se existir
    EmergencyReset.clearEmergencyState();
    
    const handleStateChanged = (newState: typeof authState) => {
      logger.info('[SIMPLE-AUTH-PROVIDER] Estado atualizado via AuthManager', {
        hasUser: !!newState.user,
        isLoading: newState.isLoading,
        isAdmin: newState.isAdmin,
        error: newState.error
      });
      
      setAuthState(newState);
    };
    
    const unsubscribe = authManager.on('stateChanged', handleStateChanged);
    
    const initializeAuth = async () => {
      try {
        // Timeout na inicialização para evitar travamento
        await Promise.race([
          authManager.initialize(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout na inicialização do AuthManager')), 10000)
          )
        ]);
        
        const currentState = authManager.getState();
        setAuthState(currentState);
        
      } catch (error) {
        logger.error('[SIMPLE-AUTH-PROVIDER] Erro na inicialização:', error);
        
        // Marcar para reset de emergência
        EmergencyReset.markEmergencyState();
        
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Falha na inicialização. Use o botão de Reset Sistema se necessário.' 
        }));
      }
    };

    initializeAuth();
    
    return () => {
      unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    const authManager = AuthManager.getInstance();
    try {
      await authManager.initialize();
    } catch (error) {
      logger.error('[SIMPLE-AUTH-PROVIDER] Erro no refresh:', error);
    }
  };

  const contextValue: SimpleAuthContextType = {
    user: authState.user,
    session: authState.session,
    profile: authState.profile,
    isLoading: authState.isLoading,
    error: authState.error,
    isAdmin: authState.isAdmin,
    isFormacao: authState.isFormacao,
    refreshProfile,
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

export const useAuth = useSimpleAuth;
