
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
  
  // Set up loading display logic with reduced timeouts
  useEffect(() => {
    // Skip auth checks for public routes
    if (location.pathname === '/index' || location.pathname === '/auth') {
      return;
    }
    
    // Only show loading if the process takes more than 200ms
    let loadingTimerId: number | null = null;
    
    if ((isInitializing || isLoading) && !user) {
      loadingTimerId = window.setTimeout(() => {
        setShowLoading(true);
      }, 200);
      
      // Ultra short timeout to force navigation if it takes too long
      const navigationTimerId = window.setTimeout(() => {
        if ((isLoading || isInitializing) && !user) {
          console.log("AuthSession: Redirecting due to loading timeout");
          setIsLoading(false);
          setIsInitializing(false);
          navigate('/auth', { replace: true });
        }
        setShowLoading(false);
      }, 2000); // Increased timeout for better user experience
      
      return () => {
        if (loadingTimerId) window.clearTimeout(loadingTimerId);
        window.clearTimeout(navigationTimerId);
      };
    } else {
      setShowLoading(false);
    }
    
    return () => {
      if (loadingTimerId) window.clearTimeout(loadingTimerId);
    };
  }, [isInitializing, isLoading, location.pathname, navigate, setIsLoading, user]);

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
