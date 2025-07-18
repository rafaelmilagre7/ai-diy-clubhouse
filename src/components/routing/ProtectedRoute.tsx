
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { logger } from "@/utils/logger";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireFormacao?: boolean;
}

/**
 * ProtectedRoute simplificado - remove loops de navegação
 */
const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  requireAdmin = false,
  requireFormacao = false
}: ProtectedRouteProps) => {
  const { user, profile, isAdmin, isFormacao, isLoading } = useAuth();
  const location = useLocation();

  // Loading simples sem circuit breaker
  if (isLoading) {
    return <LoadingScreen message="Verificando acesso..." />;
  }

  // Verificação de autenticação
  if (requireAuth && !user) {
    logger.info("[PROTECTED] Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificação de perfil
  if (requireAuth && user && !profile) {
    logger.warn("[PROTECTED] Usuário sem perfil, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Verificação de admin
  if (requireAdmin && !isAdmin) {
    logger.warn("[PROTECTED] Acesso negado - admin necessário");
    return <Navigate to="/dashboard" replace />;
  }

  // Verificação de formação
  if (requireFormacao && !(isFormacao || isAdmin)) {
    logger.warn("[PROTECTED] Acesso negado - formação necessário");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
