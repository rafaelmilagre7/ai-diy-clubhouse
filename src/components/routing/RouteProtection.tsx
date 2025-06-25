
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

export type ProtectionLevel = 'public' | 'authenticated' | 'admin' | 'formacao';

interface RouteProtectionProps {
  children: ReactNode;
  level: ProtectionLevel;
  fallbackPath?: string;
}

export const RouteProtection = ({ 
  children, 
  level, 
  fallbackPath = '/dashboard' 
}: RouteProtectionProps) => {
  const location = useLocation();
  const { user, isAdmin, isFormacao, isLoading } = useAuth();

  // Log apenas em desenvolvimento
  if (import.meta.env.DEV) {
    logger.info("[ROUTE-PROTECTION] Verificando:", {
      pathname: location.pathname,
      level,
      hasUser: !!user,
      isLoading
    });
  }

  // Loading enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen message="Verificando acesso..." />;
  }

  // Rotas públicas - sempre permitir
  if (level === 'public') {
    return <>{children}</>;
  }

  // Sem usuário para rotas protegidas = login
  if (!user) {
    logger.info("[ROUTE-PROTECTION] Redirecionando para /login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Verificar permissão de admin
  if (level === 'admin' && !isAdmin) {
    toast.error("Você não tem permissão para acessar esta área administrativa");
    return <Navigate to={fallbackPath} replace />;
  }

  // Verificar permissão de formação
  if (level === 'formacao' && !(isAdmin || isFormacao)) {
    toast.error("Você não tem permissão para acessar esta área de formação");
    return <Navigate to={fallbackPath} replace />;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
};
