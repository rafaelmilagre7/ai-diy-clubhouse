
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
    // Skip auth checks for public routes
    if (location.pathname === '/index' || location.pathname === '/auth') {
      return;
    }
    
    if ((isInitializing || isLoading) && !user) {
      // Mostrar tela de carregamento imediatamente para feedback visual rápido
      setShowLoading(true);
      
      // Timeout mais curto para forçar navegação se demorar muito
      const forceNavigateTimeout = window.setTimeout(() => {
        if (isLoading || isInitializing) {
          console.log("AuthSession: Redirecionando devido ao timeout de carregamento");
          setIsLoading(false);
          navigate('/auth', { replace: true });
        }
        setShowLoading(false);
      }, 800); // Tempo ainda mais reduzido
      
      return () => {
        window.clearTimeout(forceNavigateTimeout);
      };
    } else {
      setShowLoading(false);
    }
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

  // Fast pass - Se temos usuário, mostrar conteúdo imediatamente
  const isAuthenticated = !!user;
  if (isAuthenticated && !isLoading) {
    return <>{children}</>;
  }

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

  // Default case - render children
  return <>{children}</>;
};

export default AuthSession;
