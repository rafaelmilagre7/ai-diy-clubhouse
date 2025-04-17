
import { useEffect } from 'react';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

const AuthSession = () => {
  const {
    isInitializing,
    authError,
    retryCount,
    maxRetries,
    setRetryCount,
    setIsInitializing,
    setAuthError
  } = useAuthSession();
  
  // Effect to handle session initialization errors
  useEffect(() => {
    if (!isInitializing && authError && retryCount > 0) {
      console.error(`AuthSession: Authentication error (attempt ${retryCount}/${maxRetries}):`, authError);
    }
  }, [isInitializing, authError, retryCount, maxRetries]);
  
  // Don't render anything during initialization
  if (isInitializing) {
    return null;
  }
  
  // Don't render anything if no error
  if (!authError) {
    return null;
  }
  
  // Only show error alert after exceeding retry count to reduce UI noise
  if (retryCount <= maxRetries) {
    return null;
  }
  
  // Reset error state and trigger retry
  const handleRetry = () => {
    setAuthError(null);
    setRetryCount(0);
    setIsInitializing(true);
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-[90vw]">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro de Autenticação</AlertTitle>
        <AlertDescription className="mt-2">
          <p>Ocorreu um erro ao carregar sua sessão. Tente novamente.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry} 
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AuthSession;
