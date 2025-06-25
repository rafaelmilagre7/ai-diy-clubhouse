
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useFastAuth } from "@/contexts/auth/FastAuthProvider";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import EnhancedLoadingScreen from "@/components/common/EnhancedLoadingScreen";
import { SecurityProvider } from "@/contexts/auth/SecurityContext";
import { InviteTokenManager } from "@/utils/inviteTokenManager";
import { useSmartTimeout } from "@/contexts/auth/hooks/useSmartTimeout";
import { logger } from "@/utils/logger";
import { useState } from "react";

interface FastProtectedRoutesProps {
  children: ReactNode;
  allowInviteFlow?: boolean;
}

export const FastProtectedRoutes = ({ children, allowInviteFlow = false }: FastProtectedRoutesProps) => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useFastAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  const [hasError, setHasError] = useState(false);

  const isInInviteFlow = InviteTokenManager.hasToken() || location.pathname.includes('/invite');
  const totalLoading = authLoading || onboardingLoading;

  const { startTimeout, clearTimeout } = useSmartTimeout({
    context: 'fast-protected-routes',
    authTimeout: 8000, // Reduzido de 12s para 8s
  });

  // Timeout otimizado
  useState(() => {
    if (totalLoading && !hasError) {
      const timeoutId = startTimeout('auth', () => {
        logger.error("[FAST-PROTECTED-ROUTES] Timeout na verificação de acesso");
        setHasError(true);
      });

      return () => clearTimeout(timeoutId);
    }
  });

  logger.info("[FAST-PROTECTED-ROUTES] Estado:", {
    pathname: location.pathname,
    hasUser: !!user,
    authLoading,
    onboardingLoading,
    onboardingRequired,
    allowInviteFlow,
    isInInviteFlow,
    hasError
  });

  const handleRetry = () => {
    logger.info("[FAST-PROTECTED-ROUTES] Tentativa de retry");
    setHasError(false);
  };

  const handleForceExit = () => {
    logger.warn("[FAST-PROTECTED-ROUTES] Forçando logout");
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    window.location.href = '/auth';
  };

  // Se há erro
  if (hasError) {
    return (
      <EnhancedLoadingScreen
        message="Problema na verificação de segurança"
        context="fast-protected-routes-error"
        isLoading={false}
        onRetry={handleRetry}
        onForceExit={handleForceExit}
        showProgress={false}
      />
    );
  }

  // Loading otimizado
  if (totalLoading) {
    return (
      <EnhancedLoadingScreen
        message="Verificando credenciais..."
        context="fast-protected-routes"
        isLoading={true}
        onRetry={handleRetry}
      />
    );
  }

  // Sem usuário = login
  if (!user) {
    logger.info("[FAST-PROTECTED-ROUTES] Sem usuário -> login");
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Permitir fluxo de convite se configurado
  if (allowInviteFlow && isInInviteFlow) {
    logger.info("[FAST-PROTECTED-ROUTES] Fluxo de convite permitido");
    return (
      <SecurityProvider>
        {children}
      </SecurityProvider>
    );
  }

  // Onboarding obrigatório (exceto se já estiver na rota)
  if (onboardingRequired && location.pathname !== '/onboarding') {
    logger.info("[FAST-PROTECTED-ROUTES] Redirecionando para onboarding");
    
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
