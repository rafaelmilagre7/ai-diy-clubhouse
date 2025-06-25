
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
  const [hasError, setHasError] = useState(false);
  
  const totalLoading = authLoading || onboardingLoading;
  
  // CORREÇÃO: Timeout reduzido para 5s
  const timeoutMs = 5000;
  
  const { hasTimedOut, retry } = useLoadingTimeoutEnhanced({
    isLoading: totalLoading,
    context: 'root-redirect',
    timeoutMs,
    onTimeout: () => {
      logger.error("[ROOT-REDIRECT] Timeout na verificação inicial");
      setHasError(true);
    }
  });

  // CORREÇÃO: Monitor de erros simplificado
  useEffect(() => {
    if (authError && !import.meta.env.DEV) {
      logger.error("[ROOT-REDIRECT] Erro de auth detectado:", authError);
      setHasError(true);
    }
  }, [authError]);

  // CORREÇÃO: Log apenas em desenvolvimento e menos verboso
  useEffect(() => {
    if (import.meta.env.DEV) {
      logger.info("[ROOT-REDIRECT] Estado:", {
        hasUser: !!user,
        hasProfile: !!profile,
        userRole: profile ? getUserRoleName(profile) : null,
        totalLoading,
        hasError,
        hasTimedOut
      });
    }
  }, [user, profile, totalLoading, hasError, hasTimedOut]);

  const handleRetry = () => {
    logger.info("[ROOT-REDIRECT] Tentativa de retry");
    setHasError(false);
    retry();
  };

  const handleForceExit = async () => {
    logger.info("[ROOT-REDIRECT] Forçando limpeza e redirecionamento");
    
    // Limpeza rápida
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erro na limpeza:', error);
    }
    
    window.location.href = '/auth';
  };

  // CORREÇÃO: Condições de erro mais específicas
  const shouldShowError = hasTimedOut || hasError;

  if (shouldShowError) {
    return (
      <EnhancedLoadingScreen
        message={authError ? `Erro: ${authError}` : "Problema na verificação de acesso"}
        context="root-redirect-error"
        isLoading={false}
        onRetry={handleRetry}
        onForceExit={handleForceExit}
        showProgress={false}
      />
    );
  }

  // CORREÇÃO: Loading mais direto
  if (totalLoading) {
    return (
      <EnhancedLoadingScreen
        message="Verificando credenciais..."
        context="root-redirect"
        isLoading={true}
        onRetry={handleRetry}
      />
    );
  }

  // CORREÇÃO: Verificações mais diretas sem retry complexo
  if (!user) {
    logger.info("[ROOT-REDIRECT] Sem usuário -> auth");
    return <Navigate to="/auth" replace />;
  }

  if (user && !profile) {
    // Aguardar um momento para o perfil carregar, mas não muito
    logger.info("[ROOT-REDIRECT] Aguardando perfil...");
    return (
      <EnhancedLoadingScreen
        message="Carregando perfil..."
        context="profile"
        isLoading={true}
        onRetry={handleRetry}
      />
    );
  }

  if (onboardingRequired) {
    logger.info("[ROOT-REDIRECT] Onboarding obrigatório -> /onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // CORREÇÃO: Roteamento baseado no papel mais simples
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
