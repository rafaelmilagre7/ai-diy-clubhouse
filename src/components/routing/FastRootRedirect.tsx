
import { Navigate } from "react-router-dom";
import { useFastAuth } from "@/contexts/auth/FastAuthProvider";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import EnhancedLoadingScreen from "@/components/common/EnhancedLoadingScreen";
import { useSmartTimeout } from "@/contexts/auth/hooks/useSmartTimeout";
import { logger } from "@/utils/logger";
import { useState, useEffect } from "react";
import { getUserRoleName } from "@/lib/supabase/types";

const FastRootRedirect = () => {
  const { user, profile, isLoading: authLoading, error: authError } = useFastAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const totalLoading = authLoading || onboardingLoading;
  
  const { startTimeout, clearTimeout } = useSmartTimeout({
    context: 'fast-root-redirect',
    authTimeout: 5000, // Reduzido de 12s para 5s
    profileTimeout: 3000,
  });

  // Timeout otimizado
  useEffect(() => {
    if (totalLoading && !hasError) {
      const timeoutId = startTimeout('auth', () => {
        logger.error("[FAST-ROOT-REDIRECT] Timeout na verificação inicial");
        setHasError(true);
      });

      return () => clearTimeout(timeoutId);
    }
  }, [totalLoading, hasError, startTimeout, clearTimeout]);

  // Monitor de erros do auth
  useEffect(() => {
    if (authError) {
      logger.error("[FAST-ROOT-REDIRECT] Erro de auth detectado:", authError);
      setHasError(true);
    }
  }, [authError]);

  // Log otimizado do estado
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.info("[FAST-ROOT-REDIRECT] Estado atual:", {
        hasUser: !!user,
        hasProfile: !!profile,
        userRole: profile ? getUserRoleName(profile) : null,
        authLoading,
        onboardingLoading,
        onboardingRequired,
        retryCount,
        hasError
      });
    }
  }, [user, profile, authLoading, onboardingLoading, onboardingRequired, retryCount, hasError]);

  const handleRetry = () => {
    logger.info("[FAST-ROOT-REDIRECT] Tentativa de retry", { attempt: retryCount + 1 });
    setRetryCount(prev => prev + 1);
    setHasError(false);
    
    // Se já tentou 3 vezes, forçar limpeza
    if (retryCount >= 2) {
      logger.warn("[FAST-ROOT-REDIRECT] Muitas tentativas, redirecionando para auth");
      return <Navigate to="/auth" replace />;
    }
  };

  const handleForceExit = () => {
    logger.info("[FAST-ROOT-REDIRECT] Forçando redirecionamento para auth");
    return <Navigate to="/auth" replace />;
  };

  // Se há erro, mostrar tela de erro
  if (hasError || authError) {
    return (
      <EnhancedLoadingScreen
        message={authError ? `Erro de autenticação` : "Problema na verificação de acesso"}
        context="fast-root-redirect-error"
        isLoading={false}
        onRetry={handleRetry}
        onForceExit={handleForceExit}
        showProgress={false}
      />
    );
  }

  // Loading otimizado
  if (totalLoading) {
    const loadingContext = authLoading ? 'auth' : 'onboarding';
    const loadingMessage = authLoading ? 'Verificando credenciais...' : 'Verificando progresso...';
    
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
    logger.info("[FAST-ROOT-REDIRECT] Sem usuário -> redirecionando para auth");
    return <Navigate to="/auth" replace />;
  }

  // Verificação otimizada de perfil
  if (user && !profile) {
    logger.warn("[FAST-ROOT-REDIRECT] Usuário sem perfil válido");
    
    // Se já tentou algumas vezes, forçar recriação
    if (retryCount >= 2) {
      return <Navigate to="/auth" replace />;
    }
    
    return (
      <EnhancedLoadingScreen
        message="Carregando perfil..."
        context="profile"
        isLoading={true}
        onRetry={handleRetry}
      />
    );
  }

  // Onboarding obrigatório
  if (onboardingRequired) {
    logger.info("[FAST-ROOT-REDIRECT] Onboarding obrigatório -> /onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // Determinar rota baseada no papel do usuário
  const userRole = getUserRoleName(profile);
  
  if (userRole === 'formacao') {
    logger.info("[FAST-ROOT-REDIRECT] Usuário formação -> /formacao");
    return <Navigate to="/formacao" replace />;
  }

  if (userRole === 'admin') {
    logger.info("[FAST-ROOT-REDIRECT] Usuário admin -> /admin");
    return <Navigate to="/admin" replace />;
  }

  // Padrão = dashboard
  logger.info("[FAST-ROOT-REDIRECT] Redirecionamento padrão -> /dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default FastRootRedirect;
