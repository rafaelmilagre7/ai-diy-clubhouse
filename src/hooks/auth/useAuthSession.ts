
import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/auth';
import { useAuthStateManager } from './useAuthStateManager';

export const useAuthSession = () => {
  const { setIsLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  const { setupAuthSession } = useAuthStateManager();

  // Handle session initialization and retries
  useEffect(() => {
    if (retryCount > maxRetries) {
      console.error(`Atingido limite máximo de ${maxRetries} tentativas de autenticação`);
      setIsInitializing(false);
      return;
    }

    const initializeSession = async () => {
      setIsLoading(true);
      
      try {
        console.log("Inicializando sessão de autenticação...");
        
        const { success, error } = await setupAuthSession();
        
        if (!success) {
          throw error;
        }
        
        // Limpar estados de erro e carregamento
        setAuthError(null);
        setIsInitializing(false);
      } catch (error) {
        console.error("Erro durante inicialização da sessão:", error);
        setAuthError(error instanceof Error ? error : new Error('Erro desconhecido de autenticação'));
        setRetryCount(count => count + 1);
        setIsInitializing(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeSession();
  }, [retryCount, setIsLoading, maxRetries, setupAuthSession]);

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
