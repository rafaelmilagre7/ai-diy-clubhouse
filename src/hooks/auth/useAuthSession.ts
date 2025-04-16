
import { useState, useEffect, useRef } from "react";
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
  const maxRetries = 2;
  const isMounted = useRef(true);
  const timeoutRef = useRef<number | null>(null);
  
  const { setupAuthSession } = useAuthStateManager();

  // Handle component lifecycle
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle session initialization with longer timeout for better UX
  useEffect(() => {
    if (retryCount > maxRetries || !isMounted.current) {
      return;
    }
    
    const initializeSession = async () => {
      try {
        console.log("Initializing authentication session...");
        
        const { success, error } = await setupAuthSession();
        
        if (!success) {
          throw error;
        }
        
        // Clear error states and loading states immediately
        if (isMounted.current) {
          setAuthError(null);
          setIsInitializing(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error during session initialization:", error);
        if (isMounted.current) {
          setAuthError(error instanceof Error ? error : new Error('Unknown authentication error'));
          setRetryCount(count => count + 1);
          setIsInitializing(false);
          setIsLoading(false);
        }
      }
    };
    
    // Start session initialization immediately
    initializeSession();
    
    // Set a longer timeout as a fallback
    timeoutRef.current = window.setTimeout(() => {
      if (isInitializing && isMounted.current) {
        console.log("Session initialization timeout exceeded");
        setIsInitializing(false);
        setIsLoading(false);
      }
    }, 3000); // Longer timeout for better UX
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
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
