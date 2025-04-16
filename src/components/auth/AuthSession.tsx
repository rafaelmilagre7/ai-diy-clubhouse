
import React, { useEffect } from "react";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import AuthErrorDisplay from "@/components/auth/AuthErrorDisplay";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useAuth } from "@/contexts/auth";
import { useNavigate, useLocation } from "react-router-dom";

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
  
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      console.log("AuthSession: Cleaning up subscription");
    };
  }, []);

  // Redirect to /index if stuck in loading state for too long
  useEffect(() => {
    let timeoutId: number;
    
    if ((isInitializing || isLoading) && location.pathname !== '/index' && location.pathname !== '/login') {
      timeoutId = window.setTimeout(() => {
        console.log("Timeout de carregamento atingido, redirecionando para /index");
        navigate("/index", { replace: true });
      }, 8000); // 8 segundos para timeout
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isInitializing, isLoading, navigate, location.pathname]);

  // Handle retry
  const handleRetry = () => {
    setRetryCount(count => count + 1);
    setIsInitializing(true);
    setAuthError(null);
  };

  // Skip auth checks for /index and /login routes
  if (location.pathname === '/index' || location.pathname === '/login') {
    return <>{children}</>;
  }

  // Verification - if user is authenticated, allow content
  const isAuthenticated = !!user;

  // Display error if authentication failed and no user is authenticated
  if (authError && !isInitializing && !isAuthenticated) {
    return (
      <AuthErrorDisplay
        error={authError}
        retryCount={retryCount}
        maxRetries={maxRetries}
        onRetry={handleRetry}
      />
    );
  }

  // Show loading screen during initialization and if no user
  if ((isInitializing || isLoading) && !isAuthenticated) {
    return <LoadingScreen />;
  }

  // Render children when authentication is complete
  return <>{children}</>;
};

export default AuthSession;
