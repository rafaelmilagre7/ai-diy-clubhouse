
import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/auth';
import { useAuthStateManager } from './useAuthStateManager';

export const useAuthSession = () => {
  // Get auth context safely
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error("useAuthSession error:", error);
    // Return default values if auth context is not available
    return {
      isInitializing: false,
      authError: new Error("Authentication provider not found"),
      retryCount: 0,
      maxRetries: 2,
      setRetryCount: () => {},
      setIsInitializing: () => {},
      setAuthError: () => {}
    };
  }
  
  const { setIsLoading } = authContext;
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 1; // Reduced to 1 retry attempt
  
  const { setupAuthSession } = useAuthStateManager();

  // Handle session initialization with extremely short timeout
  useEffect(() => {
    if (retryCount > maxRetries) {
      console.error(`Maximum number of ${maxRetries} authentication attempts reached`);
      setIsInitializing(false);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    
    const initializeSession = async () => {
      try {
        console.log("Initializing authentication session...");
        
        const { success, error } = await setupAuthSession();
        
        if (!success) {
          throw error;
        }
        
        // Clear error states and loading states immediately
        if (isMounted) {
          setAuthError(null);
          setIsInitializing(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error during session initialization:", error);
        if (isMounted) {
          setAuthError(error instanceof Error ? error : new Error('Unknown authentication error'));
          setRetryCount(count => count + 1);
          setIsInitializing(false);
          setIsLoading(false);
        }
      }
    };
    
    // Extremely short timeout for maximum acceleration
    const timeoutId = setTimeout(() => {
      if (isInitializing && isMounted) {
        console.log("Session initialization timeout exceeded");
        setIsInitializing(false);
        setIsLoading(false);
      }
    }, 500); // Only 500ms
    
    initializeSession();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
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
