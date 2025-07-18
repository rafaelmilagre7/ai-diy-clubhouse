
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

  // DEBUG: Log para rastrear o fluxo
  console.log("🔍 [PROTECTED-ROUTE] Debug:", {
    pathname: location.pathname,
    isLoading,
    user: !!user,
    profile: !!profile,
    isAdmin,
    isFormacao,
    requireAuth,
    requireAdmin,
    requireFormacao
  });

  // Loading simples sem circuit breaker
  if (isLoading) {
    console.log("⏳ [PROTECTED-ROUTE] Showing loading screen");
    return <LoadingScreen message="Verificando acesso..." />;
  }

  // Verificação de autenticação
  if (requireAuth && !user) {
    console.log("🔒 [PROTECTED-ROUTE] No user, redirecting to login");
    logger.info("[PROTECTED] Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificação de perfil
  if (requireAuth && user && !profile) {
    console.log("⚠️ [PROTECTED-ROUTE] User without profile, redirecting to login");
    logger.warn("[PROTECTED] Usuário sem perfil, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Verificação de admin
  if (requireAdmin && !isAdmin) {
    console.log("🚫 [PROTECTED-ROUTE] Admin required but user is not admin");
    logger.warn("[PROTECTED] Acesso negado - admin necessário");
    return <Navigate to="/dashboard" replace />;
  }

  // Verificação de formação
  if (requireFormacao && !(isFormacao || isAdmin)) {
    console.log("🚫 [PROTECTED-ROUTE] Formacao required but user doesn't have access");
    logger.warn("[PROTECTED] Acesso negado - formação necessário");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("✅ [PROTECTED-ROUTE] All checks passed, rendering children");
  return <>{children}</>;
};

export default ProtectedRoute;
