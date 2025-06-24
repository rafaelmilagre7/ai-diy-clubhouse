
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import EnhancedLoadingScreen from "@/components/common/EnhancedLoadingScreen";
import { useLoadingTimeoutEnhanced } from "@/hooks/useLoadingTimeoutEnhanced";
import { logger } from "@/utils/logger";
import { useState, useEffect } from "react";

const RobustRootRedirect = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const totalLoading = authLoading || onboardingLoading;
  
  const { hasTimedOut, retry } = useLoadingTimeoutEnhanced({
    isLoading: totalLoading,
    context: 'root-redirect',
    timeoutMs: 15000,
    onTimeout: () => {
      logger.error("[ROOT-REDIRECT] Timeout na verificação inicial");
      setHasError(true);
    }
  });

  // Log detalhado do estado
  useEffect(() => {
    logger.info("[ROOT-REDIRECT] Estado atual:", {
      hasUser: !!user,
      hasProfile: !!profile,
      authLoading,
      onboardingLoading,
      onboardingRequired,
      retryCount,
      hasError,
      hasTimedOut
    });
  }, [user, profile, authLoading, onboardingLoading, onboardingRequired, retryCount, hasError, hasTimedOut]);

  const handleRetry = () => {
    logger.info("[ROOT-REDIRECT] Tentativa de retry", { attempt: retryCount + 1 });
    setRetryCount(prev => prev + 1);
    setHasError(false);
    retry();
    
    // Se já tentou 3 vezes, forçar logout
    if (retryCount >= 2) {
      logger.warn("[ROOT-REDIRECT] Muitas tentativas, forçando logout");
      handleForceExit();
    }
  };

  const handleForceExit = () => {
    logger.info("[ROOT-REDIRECT] Forçando saída e limpeza");
    
    // Limpar completamente o estado de auth
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Recarregar a página para um estado limpo
    window.location.href = '/auth';
  };

  // Se há timeout ou erro, mostrar loading com opções de recuperação
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
    const loadingMessage = authLoading ? 'Verificando credenciais...' : 'Verificando seu progresso...';
    
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
  const userRole = profile?.user_roles?.name || profile?.role;
  
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
