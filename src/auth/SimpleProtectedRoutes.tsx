
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useSimpleOnboarding } from "@/hooks/useSimpleOnboarding";
import LoadingScreen from "@/components/common/LoadingScreen";
import { logger } from "@/utils/logger";

interface SimpleProtectedRoutesProps {
  children: ReactNode;
}

export const SimpleProtectedRoutes = ({ children }: SimpleProtectedRoutesProps) => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useSimpleOnboarding();

  logger.info("SimpleProtectedRoutes:", {
    pathname: location.pathname,
    hasUser: !!user,
    authLoading,
    onboardingLoading,
    onboardingRequired
  });
  
  // Loading simples
  if (authLoading || onboardingLoading) {
    return <LoadingScreen message="Verificando acesso..." />;
  }

  // Sem usuário = login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Onboarding obrigatório (exceto se já estiver na rota)
  if (onboardingRequired && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
};
