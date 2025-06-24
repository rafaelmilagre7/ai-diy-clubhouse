
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import EnhancedLoadingScreen from "@/components/common/EnhancedLoadingScreen";
import { useLoadingTimeoutEnhanced } from "@/hooks/useLoadingTimeoutEnhanced";
import { logger } from "@/utils/logger";
import { useState, useEffect } from "react";
import { cleanupAuthState, recoverFromAuthError } from "@/utils/authCleanup";
import { getUserRoleName } from "@/lib/supabase/types";

const RobustRootRedirect = () => {
  const { user, profile, isLoading: authLoading, error: authError } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const totalLoading = authLoading || onboardingLoading;
  
  const { hasTimedOut, retry } = useLoadingTimeoutEnhanced({
    isLoading: totalLoading,
    context: 'root-redirect',
    timeoutMs: 12000,
    onTimeout: () => {
      logger.error("[ROOT-REDIRECT] Timeout na verificação inicial");
      setHasError(true);
    }
  });

  // Monitor de erros do auth
  useEffect(() => {
    if (authError) {
      logger.error("[ROOT-REDIRECT] Erro de auth detectado:", authError);
      setHasError(true);
    }
  }, [authError]);

  // Log detalhado do estado
  useEffect(() => {
    logger.info("[ROOT-REDIRECT] Estado atual:", {
      hasUser: !!user,
      hasProfile: !!profile,
      userRole: profile ? getUserRoleName(profile) : null,
      authLoading,
      onboardingLoading,
      onboardingRequired,
      retryCount,
      hasError,
      hasTimedOut,
      authError
    });
  }, [user, profile, authLoading, onboardingLoading, onboardingRequired, retryCount, hasError, hasTimedOut, authError]);

  const handleRetry = () => {
    logger.info("[ROOT-REDIRECT] Tentativa de retry", { attempt: retryCount + 1 });
    setRetryCount(prev => prev + 1);
    setHasError(false);
    retry();
    
    // Se já tentou 3 vezes, forçar limpeza
    if (retryCount >= 2) {
      logger.warn("[ROOT-REDIRECT] Muitas tentativas, forçando limpeza");
      handleForceExit();
    }
  };

  const handleForceExit = async () => {
    logger.info("[ROOT-REDIRECT] Forçando limpeza e redirecionamento");
    await recoverFromAuthError();
  };

  // Se há timeout, erro de auth ou erro geral, mostrar tela de erro
  if (hasTimedOut || hasError || authError) {
    return (
      <EnhancedLoadingScreen
        message={authError ? `Erro de autenticação: ${authError}` : "Problema na verificação de acesso"}
        context="root-redirect-error"
        isLoading={false}
        onRetry={handleRetry}
        onForceExit={handleForceExit}
        showProgress={false}
      />
    );
  }

  // Loading normal
  if (totalLoading) {
    const loadingContext = authLoading ? 'auth' : 'onboarding';
    const loadingMessage = authLoading ? 'Verificando suas credenciais...' : 'Verificando seu progresso...';
    
    return (
      <EnhancedLoadingScreen
        message={loadingMessage}
        context={loadingContext}
        isLoading={true}
        onRetry={handleRetry}
      />
    );
  }

  // Sem usuário = login
  if (!user) {
    logger.info("[ROOT-REDIRECT] Sem usuário -> redirecionando para auth");
    return <Navigate to="/auth" replace />;
  }

  // Verificação de perfil mais robusta
  if (user && !profile) {
    logger.warn("[ROOT-REDIRECT] Usuário sem perfil válido");
    
    // Se já tentou algumas vezes, forçar recriação
    if (retryCount >= 2) {
      return <Navigate to="/auth" replace />;
    }
    
    return (
      <EnhancedLoadingScreen
        message="Carregando seu perfil..."
        context="profile"
        isLoading={true}
        onRetry={handleRetry}
      />
    );
  }

  // Onboarding obrigatório
  if (onboardingRequired) {
    logger.info("[ROOT-REDIRECT] Onboarding obrigatório -> /onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // Determinar rota baseada no papel do usuário
  const userRole = getUserRoleName(profile);
  
  if (userRole === 'formacao') {
    logger.info("[ROOT-REDIRECT] Usuário formação -> /formacao");
    return <Navigate to="/formacao" replace />;
  }

  if (userRole === 'admin') {
    logger.info("[ROOT-REDIRECT] Usuário admin -> /admin");
    return <Navigate to="/admin" replace />;
  }

  // Padrão = dashboard
  logger.info("[ROOT-REDIRECT] Redirecionamento padrão -> /dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RobustRootRedirect;
