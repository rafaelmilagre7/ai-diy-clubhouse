
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import LoadingScreen from "@/components/common/LoadingScreen";
import { InviteTokenManager } from "@/utils/inviteTokenManager";
import { useProductionLogger } from "@/hooks/useProductionLogger";

interface RobustProtectedRoutesProps {
  children: ReactNode;
  allowInviteFlow?: boolean;
}

export const RobustProtectedRoutes = ({ children, allowInviteFlow = false }: RobustProtectedRoutesProps) => {
  const location = useLocation();
  const { user, isAdmin, isLoading: authLoading } = useSimpleAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  const { log } = useProductionLogger({ component: 'RobustProtectedRoutes' });

  const isInInviteFlow = InviteTokenManager.hasToken() || location.pathname.includes('/invite');
  const totalLoading = authLoading || onboardingLoading;

  log("Estado atual:", {
    pathname: location.pathname,
    hasUser: !!user,
    authLoading,
    onboardingLoading,
    onboardingRequired,
    allowInviteFlow,
    isInInviteFlow,
    isAdmin
  });

  // Loading
  if (totalLoading) {
    return <LoadingScreen message="Verificando credenciais..." />;
  }

  // Sem usuário = login
  if (!user) {
    log("Sem usuário -> /login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // CORREÇÃO CRÍTICA: Admin bypass ABSOLUTO - nunca bloquear admin
  if (isAdmin) {
    log("👑 ADMIN detectado - Acesso total liberado", {
      pathname: location.pathname,
      userId: user.id.substring(0, 8) + '***',
      onboardingRequired: onboardingRequired,
      bypassReason: 'ADMIN_ABSOLUTE_BYPASS'
    });
    return <>{children}</>;
  }

  // Permitir fluxo de convite se configurado E específico
  if (allowInviteFlow && isInInviteFlow && location.pathname.includes('/onboarding')) {
    log("Fluxo de convite permitido APENAS para onboarding");
    return <>{children}</>;
  }

  // REGRA: Onboarding obrigatório PARA USUÁRIOS COMUNS (não admin)
  if (onboardingRequired && location.pathname !== '/onboarding') {
    log("Redirecionando usuário comum para onboarding obrigatório", {
      userId: user.id.substring(0, 8) + '***',
      isAdmin,
      pathname: location.pathname,
      reason: 'ONBOARDING_REQUIRED_NON_ADMIN'
    });
    
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
  return <>{children}</>;
};
