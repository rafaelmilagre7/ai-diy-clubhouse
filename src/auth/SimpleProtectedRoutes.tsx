
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { ReactNode, startTransition } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { logger } from "@/utils/logger";

interface SimpleProtectedRoutesProps {
  children?: ReactNode;
}

export const SimpleProtectedRoutes = ({ children }: SimpleProtectedRoutesProps) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  // Log apenas em desenvolvimento - wrapped em startTransition
  if (import.meta.env.DEV) {
    startTransition(() => {
      logger.info("[SIMPLE-PROTECTED] Estado:", {
        pathname: location.pathname,
        hasUser: !!user,
        isLoading
      });
    });
  }

  // Loading simples
  if (isLoading) {
    return <LoadingScreen message="Verificando acesso..." />;
  }

  // Sem usuário = login - usar startTransition para navegação
  if (!user) {
    startTransition(() => {
      logger.info("[SIMPLE-PROTECTED] Redirecionando para /login");
    });
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Renderizar conteúdo protegido
  return children ? <>{children}</> : <Outlet />;
};
