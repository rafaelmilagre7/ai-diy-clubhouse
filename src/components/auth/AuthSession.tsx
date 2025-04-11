
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

  // Display error if authentication failed
  if (authError && !isInitializing) {
    return (
      <AuthErrorDisplay
        error={authError}
        retryCount={retryCount}
        maxRetries={maxRetries}
        onRetry={handleRetry}
      />
    );
  }

  // Show loading screen during initialization
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Render children when authentication is complete
  return <>{children}</>;
};

export default AuthSession;
