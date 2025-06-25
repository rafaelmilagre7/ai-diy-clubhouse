
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import EnhancedLoadingScreen from "@/components/common/EnhancedLoadingScreen";
import { SecurityProvider } from "@/contexts/auth/SecurityContext";
import { InviteTokenManager } from "@/utils/inviteTokenManager";
import { useLoadingTimeoutEnhanced } from "@/hooks/useLoadingTimeoutEnhanced";
import { logger } from "@/utils/logger";
import { useState } from "react";

interface RobustProtectedRoutesProps {
  children: ReactNode;
  allowInviteFlow?: boolean;
}

export const RobustProtectedRoutes = ({ children, allowInviteFlow = false }: RobustProtectedRoutesProps) => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  const [hasError, setHasError] = useState(false);

  const isInInviteFlow = InviteTokenManager.hasToken() || location.pathname.includes('/invite');
  const totalLoading = authLoading || onboardingLoading;

  // CORREÇÃO: Timeout reduzido para 5s
  const { hasTimedOut, retry } = useLoadingTimeoutEnhanced({
    isLoading: totalLoading,
    context: 'protected-routes',
    timeoutMs: 5000,
    onTimeout: () => {
      logger.error("[PROTECTED-ROUTES] Timeout na verificação de acesso");
      setHasError(true);
    }
  });

  // CORREÇÃO: Log simplificado
  if (import.meta.env.DEV) {
    logger.info("[PROTECTED-ROUTES] Estado:", {
      pathname: location.pathname,
      hasUser: !!user,
      totalLoading,
      onboardingRequired,
      allowInviteFlow,
      isInInviteFlow,
      hasError,
      hasTimedOut
    });
  }

  const handleRetry = () => {
    logger.info("[PROTECTED-ROUTES] Tentativa de retry");
    setHasError(false);
    retry();
  };

  const handleForceExit = () => {
    logger.warn("[PROTECTED-ROUTES] Forçando logout");
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    window.location.href = '/auth';
  };

  // CORREÇÃO: Condições de erro mais específicas
  if (hasTimedOut || hasError) {
    return (
      <EnhancedLoadingScreen
        message="Problema na verificação de segurança"
        context="protected-routes-error"
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
        context="protected-routes"
        isLoading={true}
        onRetry={handleRetry}
      />
    );
  }

  // Sem usuário = login
  if (!user) {
    logger.info("[PROTECTED-ROUTES] Sem usuário -> login");
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Permitir fluxo de convite se configurado
  if (allowInviteFlow && isInInviteFlow) {
    logger.info("[PROTECTED-ROUTES] Fluxo de convite permitido");
    return (
      <SecurityProvider>
        {children}
      </SecurityProvider>
    );
  }

  // Onboarding obrigatório (exceto se já estiver na rota)
  if (onboardingRequired && location.pathname !== '/onboarding') {
    logger.info("[PROTECTED-ROUTES] Redirecionando para onboarding");
    
    // Preservar token se em fluxo de convite
    if (isInInviteFlow) {
      const currentToken = InviteTokenManager.getToken();
      if (currentToken) {
        InviteTokenManager.storeToken(currentToken);
        return <Navigate to={`/onboarding?token=${currentToken}`} replace />;
      }
    }
    
    return <Navigate to="/onboarding" replace />;
  }

  // Renderizar conteúdo protegido
  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
};
