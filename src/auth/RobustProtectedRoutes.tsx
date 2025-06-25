
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import LoadingScreen from "@/components/common/LoadingScreen";
import { InviteTokenManager } from "@/utils/inviteTokenManager";
import { logger } from "@/utils/logger";

interface RobustProtectedRoutesProps {
  children: ReactNode;
  allowInviteFlow?: boolean;
}

export const RobustProtectedRoutes = ({ children, allowInviteFlow = false }: RobustProtectedRoutesProps) => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useSimpleAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();

  const isInInviteFlow = InviteTokenManager.hasToken() || location.pathname.includes('/invite');
  const totalLoading = authLoading || onboardingLoading;

  logger.info("[PROTECTED-ROUTES] Estado (ONBOARDING OBRIGATÓRIO):", {
    pathname: location.pathname,
    hasUser: !!user,
    authLoading,
    onboardingLoading,
    onboardingRequired,
    allowInviteFlow,
    isInInviteFlow
  });

  // Loading
  if (totalLoading) {
    return <LoadingScreen message="Verificando credenciais..." />;
  }

  // Sem usuário = login
  if (!user) {
    logger.info("[PROTECTED-ROUTES] Sem usuário -> login");
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Permitir fluxo de convite se configurado E específico
  if (allowInviteFlow && isInInviteFlow && location.pathname.includes('/onboarding')) {
    logger.info("[PROTECTED-ROUTES] Fluxo de convite permitido APENAS para onboarding");
    return <>{children}</>;
  }

  // REGRA CRÍTICA: Onboarding obrigatório PARA TODOS (sem exceção)
  if (onboardingRequired && location.pathname !== '/onboarding') {
    logger.info("[PROTECTED-ROUTES] Redirecionando para onboarding OBRIGATÓRIO (sem exceções)");
    
    if (isInInviteFlow) {
      const currentToken = InviteTokenManager.getToken();
      if (currentToken) {
        InviteTokenManager.storeToken(currentToken);
        return <Navigate to={`/onboarding?token=${currentToken}`} replace />;
      }
    }
    
    return <Navigate to="/onboarding" replace />;
  }

  // Renderizar conteúdo protegido apenas após onboarding completo
  return <>{children}</>;
};
