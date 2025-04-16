
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

  // Configurar um timeout muito curto para mostrar a tela de carregamento
  useEffect(() => {
    if ((isInitializing || isLoading) && location.pathname !== '/index' && location.pathname !== '/auth') {
      // Se estamos carregando, mostrar a tela de carregamento
      // mas apenas por um tempo muito curto
      const timeoutId = window.setTimeout(() => {
        setShowLoading(true);
      }, 300); // Mostrar após 300ms para evitar flashes
      
      // Timeout para forçar a navegação caso demore muito
      const forceNavigateTimeout = window.setTimeout(() => {
        if (isLoading || isInitializing) {
          console.log("AuthSession: Redirecionando para /auth devido ao timeout de carregamento");
          setIsLoading(false);
          navigate('/auth', { replace: true });
        }
        setShowLoading(false);
      }, 1000); // Reduzido para 1 segundo
      
      return () => {
        window.clearTimeout(timeoutId);
        window.clearTimeout(forceNavigateTimeout);
      };
    } else {
      setShowLoading(false);
    }
  }, [isInitializing, isLoading, location.pathname, navigate, setIsLoading]);

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

  // Show loading screen only if necessary and for a short time
  if ((isInitializing || isLoading) && !isAuthenticated && showLoading) {
    return <LoadingScreen />;
  }

  // Render children when authentication is complete
  return <>{children}</>;
};

export default AuthSession;
