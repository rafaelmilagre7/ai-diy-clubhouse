
import React, { useEffect, useState } from "react";
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
  // We need to handle the case where AuthSession might be used outside of AuthProvider
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
    const navigate = useNavigate();
    const location = useLocation();
    const [showLoading, setShowLoading] = useState(true);

    // Start a timeout to prevent infinite loading
    useEffect(() => {
      let timeoutId: number;
      
      if ((isInitializing || isLoading) && location.pathname !== '/index' && location.pathname !== '/login') {
        setShowLoading(true);
        timeoutId = window.setTimeout(() => {
          console.log("Timeout de carregamento atingido, redirecionando para /index");
          setShowLoading(false);
          navigate("/index", { replace: true });
        }, 5000); // 5 segundos para timeout
      } else {
        setShowLoading(false);
      }
      
      return () => {
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    }, [isInitializing, isLoading, navigate, location.pathname]);

    // Cleanup subscription on unmount
    useEffect(() => {
      return () => {
        console.log("AuthSession: Cleaning up subscription");
      };
    }, []);

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
    if ((isInitializing || isLoading) && !isAuthenticated && showLoading) {
      return <LoadingScreen />;
    }

    // Render children when authentication is complete
    return <>{children}</>;
  } catch (error) {
    // If there's an error (likely because useAuth is used outside AuthProvider),
    // redirect to index page
    console.error("AuthSession error:", error);
    
    // Since we can't use navigate here (as it requires React Router context),
    // we'll render children and let the app's normal error boundaries handle it
    return <>{children}</>;
  }
};

export default AuthSession;
