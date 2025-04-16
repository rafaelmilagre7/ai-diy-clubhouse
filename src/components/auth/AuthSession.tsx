
import React, { useEffect } from "react";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import AuthErrorDisplay from "@/components/auth/AuthErrorDisplay";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

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

  // Função para limpar a assinatura ao desmontar
  useEffect(() => {
    return () => {
      console.log("AuthSession: Cleaning up subscription");
    };
  }, []);

  // Se estiver travado no carregamento por muito tempo, forçar redirecionamento para /index
  useEffect(() => {
    let timeoutId: number;
    
    if (isInitializing || isLoading) {
      timeoutId = window.setTimeout(() => {
        console.log("Timeout de carregamento atingido, redirecionando para /index");
        navigate("/index", { replace: true });
      }, 8000); // 8 segundos para timeout
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isInitializing, isLoading, navigate]);

  // Lidar com tentativa de nova autenticação
  const handleRetry = () => {
    setRetryCount(count => count + 1);
    setIsInitializing(true);
    setAuthError(null);
  };

  // Verificação adicional - se o usuário está autenticado, permite passar para o conteúdo
  const isAuthenticated = !!user;

  // Exibir erro se a autenticação falhou e não tem usuário autenticado
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

  // Mostrar tela de carregamento durante inicialização e se não tiver usuário
  if ((isInitializing || isLoading) && !isAuthenticated) {
    return <LoadingScreen />;
  }

  // Renderizar filhos quando a autenticação estiver completa
  return <>{children}</>;
};

export default AuthSession;
