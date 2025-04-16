
import React, { useEffect } from "react";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import AuthErrorDisplay from "@/components/auth/AuthErrorDisplay";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useAuth } from "@/contexts/auth";

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
  
  const { user } = useAuth();

  // Function to clean up the subscription on unmount
  useEffect(() => {
    return () => {
      console.log("AuthSession: Cleaning up subscription");
    };
  }, []);

  // Handle retry attempt
  const handleRetry = () => {
    setRetryCount(count => count + 1);
    setIsInitializing(true);
    setAuthError(null);
  };

  // Verificação adicional - se o usuário está autenticado, permite passar para o conteúdo
  const isAuthenticated = !!user;

  // Display error if authentication failed and não tem usuário autenticado
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

  // Show loading screen during initialization e se não tiver usuário
  if (isInitializing && !isAuthenticated) {
    return <LoadingScreen />;
  }

  // Render children when authentication is complete
  return <>{children}</>;
};

export default AuthSession;
