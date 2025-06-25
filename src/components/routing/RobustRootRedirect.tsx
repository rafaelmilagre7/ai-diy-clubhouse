
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
  
  // Timeout mais generoso para desenvolvimento
  const timeoutMs = import.meta.env.DEV ? 20000 : 12000;
  
  const { hasTimedOut, retry } = useLoadingTimeoutEnhanced({
    isLoading: totalLoading,
    context: 'root-redirect',
    timeoutMs,
    onTimeout: () => {
      logger.error("[ROOT-REDIRECT] Timeout na verificação inicial");
      setHasError(true);
    }
  });

  // Monitor de erros do auth mais permissivo
  useEffect(() => {
    if (authError && !import.meta.env.DEV) {
      logger.error("[ROOT-REDIRECT] Erro de auth detectado:", authError);
      setHasError(true);
    }
  }, [authError]);

  // Log apenas em desenvolvimento para reduzir overhead
  useEffect(() => {
    if (import.meta.env.DEV) {
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
    }
  }, [user, profile, authLoading, onboardingLoading, onboardingRequired, retryCount, hasError, hasTimedOut, authError]);

  const handleRetry = () => {
    logger.info("[ROOT-REDIRECT] Tentativa de retry", { attempt: retryCount + 1 });
    setRetryCount(prev => prev + 1);
    setHasError(false);
    retry();
    
    // Reduzir tentativas máximas para evitar loops
    if (retryCount >= 1) {
      logger.warn("[ROOT-REDIRECT] Muitas tentativas, forçando limpeza");
      handleForceExit();
    }
  };

  const handleForceExit = async () => {
    logger.info("[ROOT-REDIRECT] Forçando limpeza e redirecionamento");
    await recoverFromAuthError();
  };

  // Ser mais permissivo com erros em desenvolvimento
  const shouldShowError = hasTimedOut || hasError || (authError && !import.meta.env.DEV);

  if (shouldShowError) {
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

  // Verificação de perfil mais relaxada
  if (user && !profile) {
    // Em desenvolvimento, ser mais permissivo
    if (import.meta.env.DEV && retryCount < 1) {
      return (
        <EnhancedLoadingScreen
          message="Carregando seu perfil..."
          context="profile"
          isLoading={true}
          onRetry={handleRetry}
        />
      );
    }
    
    // Se já tentou algumas vezes, continuar sem perfil ou redirecionar
    if (retryCount >= 1) {
      logger.warn("[ROOT-REDIRECT] Continuando sem perfil após tentativas");
      return <Navigate to="/auth" replace />;
    }
  }

  // Onboarding obrigatório
  if (onboardingRequired) {
    logger.info("[ROOT-REDIRECT] Onboarding obrigatório -> /onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // Determinar rota baseada no papel do usuário
  const userRole = profile ? getUserRoleName(profile) : null;
  
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
