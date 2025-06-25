
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import EnhancedLoadingScreen from "@/components/common/EnhancedLoadingScreen";
import { useLoadingTimeoutEnhanced } from "@/hooks/useLoadingTimeoutEnhanced";
import { logger } from "@/utils/logger";
import { useState, useEffect } from "react";
import { getUserRoleName } from "@/lib/supabase/types";

const RobustRootRedirect = () => {
  const { user, profile, isLoading: authLoading, error: authError } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [forceRedirect, setForceRedirect] = useState(false);
  
  const totalLoading = authLoading || onboardingLoading;
  
  // Timeout reduzido para 6 segundos
  const timeoutMs = 6000;
  
  const { hasTimedOut, retry } = useLoadingTimeoutEnhanced({
    isLoading: totalLoading,
    context: 'root-redirect',
    timeoutMs,
    onTimeout: () => {
      logger.error("[ROOT-REDIRECT] Timeout na verificação inicial");
      setHasError(true);
    }
  });

  // Fallback de emergência - após 8 segundos, forçar redirecionamento
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      logger.warn("[ROOT-REDIRECT] Fallback de emergência - forçando redirecionamento");
      setForceRedirect(true);
    }, 8000);

    return () => clearTimeout(emergencyTimeout);
  }, []);

  // Log de desenvolvimento
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
        forceRedirect
      });
    }
  }, [user, profile, authLoading, onboardingLoading, onboardingRequired, retryCount, hasError, hasTimedOut, forceRedirect]);

  const handleRetry = () => {
    logger.info("[ROOT-REDIRECT] Tentativa de retry", { attempt: retryCount + 1 });
    setRetryCount(prev => prev + 1);
    setHasError(false);
    retry();
    
    // Máximo 1 retry para evitar loops
    if (retryCount >= 1) {
      logger.warn("[ROOT-REDIRECT] Muitas tentativas, forçando redirecionamento");
      setForceRedirect(true);
    }
  };

  const handleForceExit = async () => {
    logger.info("[ROOT-REDIRECT] Forçando limpeza e redirecionamento");
    // Limpar localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    window.location.href = '/auth';
  };

  // FORÇAR REDIRECIONAMENTO se timeout de emergência ou muitos erros
  if (forceRedirect || retryCount >= 2) {
    const userRole = profile ? getUserRoleName(profile) : null;
    
    if (user) {
      if (userRole === 'admin') {
        logger.info("[ROOT-REDIRECT] Redirecionamento forçado -> /admin");
        return <Navigate to="/admin" replace />;
      }
      if (userRole === 'formacao') {
        logger.info("[ROOT-REDIRECT] Redirecionamento forçado -> /formacao");
        return <Navigate to="/formacao" replace />;
      }
      logger.info("[ROOT-REDIRECT] Redirecionamento forçado -> /dashboard");
      return <Navigate to="/dashboard" replace />;
    } else {
      logger.info("[ROOT-REDIRECT] Redirecionamento forçado -> /auth");
      return <Navigate to="/auth" replace />;
    }
  }

  // Mostrar erro apenas se timeout ou erro crítico
  if (hasTimedOut || hasError) {
    return (
      <EnhancedLoadingScreen
        message="Problema na verificação de acesso"
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
