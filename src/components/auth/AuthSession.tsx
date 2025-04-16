
import React, { useEffect, useState } from "react";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import AuthErrorDisplay from "@/components/auth/AuthErrorDisplay";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useAuth } from "@/contexts/auth";
import { useLocation } from "react-router-dom";

/**
 * AuthSession component that handles authentication state changes
 * and provides a loading screen during authentication
 */
const AuthSession = ({ children }: { children: React.ReactNode }) => {
  try {
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
    const location = useLocation();
    const [showLoading, setShowLoading] = useState(true);

    // Start a timeout to prevent infinite loading
    useEffect(() => {
      let timeoutId: number;
      
      if ((isInitializing || isLoading) && location.pathname !== '/index' && location.pathname !== '/auth') {
        setShowLoading(true);
        timeoutId = window.setTimeout(() => {
          setShowLoading(false);
        }, 3000); // 3 segundos para timeout
      } else {
        setShowLoading(false);
      }
      
      return () => {
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    }, [isInitializing, isLoading, location.pathname]);

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
    if ((isInitializing || isLoading) && !isAuthenticated && showLoading) {
      return <LoadingScreen />;
    }

    // Render children when authentication is complete
    return <>{children}</>;
  } catch (error) {
    console.error("AuthSession error:", error);
    return <>{children}</>;
  }
};

export default AuthSession;
