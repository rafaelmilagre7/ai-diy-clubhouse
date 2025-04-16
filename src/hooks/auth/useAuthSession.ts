
import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/auth';
import { useAuthStateManager } from './useAuthStateManager';

export const useAuthSession = () => {
  // Safe access to useAuth, return defaults if not in provider context
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error("useAuthSession error:", error);
    // Return early with defaults if we can't access auth context
    return {
      isInitializing: false,
      authError: new Error("Authentication provider not found"),
      retryCount: 0,
      maxRetries: 3,
      setRetryCount: () => {},
      setIsInitializing: () => {},
      setAuthError: () => {}
    };
  }
  
  const { setIsLoading } = authContext;
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  
  const { setupAuthSession } = useAuthStateManager();

  // Handle session initialization and retries with faster timeout
  useEffect(() => {
    if (retryCount > maxRetries) {
      console.error(`Atingido limite máximo de ${maxRetries} tentativas de autenticação`);
      setIsInitializing(false);
      setIsLoading(false);
      return;
    }

    const initializeSession = async () => {
      try {
        console.log("Inicializando sessão de autenticação...");
        
        const { success, error } = await setupAuthSession();
        
        if (!success) {
          throw error;
        }
        
        // Limpar estados de erro e carregamento
        setAuthError(null);
        setIsInitializing(false);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro durante inicialização da sessão:", error);
        setAuthError(error instanceof Error ? error : new Error('Erro desconhecido de autenticação'));
        setRetryCount(count => count + 1);
        setIsInitializing(false);
        setIsLoading(false);
      }
    };
    
    // Definir um timeout bastante reduzido para inicialização da sessão
    const timeoutId = setTimeout(() => {
      if (isInitializing) {
        console.log("Tempo limite de inicialização da sessão excedido");
        setIsInitializing(false);
        setIsLoading(false);
      }
    }, 1000); // 1 segundo
    
    initializeSession();
    
    return () => clearTimeout(timeoutId);
  }, [retryCount, setIsLoading, maxRetries, setupAuthSession, isInitializing]);

  return {
    isInitializing,
    authError,
    retryCount,
    maxRetries,
    setRetryCount,
    setIsInitializing,
    setAuthError
  };
};
