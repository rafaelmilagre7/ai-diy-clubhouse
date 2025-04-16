
import React, { useEffect, useState } from "react";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import AuthErrorDisplay from "@/components/auth/AuthErrorDisplay";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useAuth } from "@/contexts/auth";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * AuthSession component that handles authentication state changes
 * and provides a loading screen during authentication
 */
const AuthSession = ({ children }: { children: React.ReactNode }) => {
  const {
    isInitializing,
    authError,
    retryCount,
    maxRetries,
    setRetryCount,
    setIsInitializing,
    setAuthError
  } = useAuthSession();
  
  const { user, isLoading, setIsLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // Set up timeout for showing loading screen
  useEffect(() => {
    // Skip auth checks for public routes
    if (location.pathname === '/index' || location.pathname === '/auth') {
      return;
    }
    
    if ((isInitializing || isLoading) && !user) {
      // Show loading screen immediately for quick visual feedback
      setShowLoading(true);
      
      // Ultra short timeout to force navigation if it takes too long
      const id = window.setTimeout(() => {
        if (isLoading || isInitializing) {
          console.log("AuthSession: Redirecting due to loading timeout");
          setIsLoading(false);
          navigate('/auth', { replace: true });
        }
        setShowLoading(false);
      }, 500); // Ultra short timeout
      
      setTimeoutId(id);
      
      return () => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      };
    } else {
      setShowLoading(false);
    }
  }, [isInitializing, isLoading, location.pathname, navigate, setIsLoading, user, timeoutId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Handle retry
  const handleRetry = () => {
    setRetryCount(count => count + 1);
    setIsInitializing(true);
    setAuthError(null);
  };

  // Skip auth checks for public routes
  if (location.pathname === '/index' || location.pathname === '/auth') {
    return <>{children}</>;
  }

  // Fast pass - If user is already authenticated, show content immediately
  if (user && !isLoading) {
    return <>{children}</>;
  }

  // Display error if authentication failed and no user is authenticated
  if (authError && !isInitializing && !user) {
    return (
      <AuthErrorDisplay
        error={authError}
        retryCount={retryCount}
        maxRetries={maxRetries}
        onRetry={handleRetry}
      />
    );
  }

  // Show loading screen only if necessary and for a short time
  if ((isInitializing || isLoading) && !user && showLoading) {
    return <LoadingScreen message="Carregando seu dashboard..." />;
  }

  // Default case - render children
  return <>{children}</>;
};

export default AuthSession;
