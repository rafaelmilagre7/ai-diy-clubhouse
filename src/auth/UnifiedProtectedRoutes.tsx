
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

interface UnifiedProtectedRoutesProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireFormacao?: boolean;
  allowInviteFlow?: boolean;
}

export const UnifiedProtectedRoutes = ({ 
  children, 
  requireAdmin = false,
  requireFormacao = false,
  allowInviteFlow = false 
}: UnifiedProtectedRoutesProps) => {
  const location = useLocation();
  const { user, isAdmin, isFormacao, isLoading } = useAuth();

  // Log apenas em desenvolvimento
  if (import.meta.env.DEV) {
    logger.info("[UNIFIED-PROTECTED] Estado:", {
      pathname: location.pathname,
      hasUser: !!user,
      isLoading,
      requireAdmin,
      requireFormacao
    });
  }

  // Loading simples
  if (isLoading) {
    return <LoadingScreen message="Verificando acesso..." />;
  }

  // Sem usuário = login
  if (!user) {
    logger.info("[UNIFIED-PROTECTED] Redirecionando para /login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Verificar permissão de admin se requerida
  if (requireAdmin && !isAdmin) {
    toast.error("Você não tem permissão para acessar esta área administrativa");
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar permissão de formação se requerida
  if (requireFormacao && !(isAdmin || isFormacao)) {
    toast.error("Você não tem permissão para acessar esta área de formação");
    return <Navigate to="/dashboard" replace />;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
};
