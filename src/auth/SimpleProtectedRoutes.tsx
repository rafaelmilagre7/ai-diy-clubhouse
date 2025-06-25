
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { logger } from "@/utils/logger";

interface SimpleProtectedRoutesProps {
  children: ReactNode;
}

export const SimpleProtectedRoutes = ({ children }: SimpleProtectedRoutesProps) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  // Log apenas em desenvolvimento
  if (import.meta.env.DEV) {
    logger.info("[SIMPLE-PROTECTED] Estado:", {
      pathname: location.pathname,
      hasUser: !!user,
      isLoading
    });
  }

  // Loading simples
  if (isLoading) {
    return <LoadingScreen message="Verificando acesso..." />;
  }

  // Sem usuário = auth (CORREÇÃO: usar /auth ao invés de /login)
  if (!user) {
    logger.info("[SIMPLE-PROTECTED] Redirecionando para /auth");
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
};
