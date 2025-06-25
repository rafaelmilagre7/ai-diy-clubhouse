
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { getUserRoleName } from "@/lib/supabase/types";

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
  const { user, profile, isLoading } = useAuth();

  // Log apenas em desenvolvimento
  if (import.meta.env.DEV) {
    logger.info("[ROUTE-PROTECTION] Verificando:", {
      pathname: location.pathname,
      level,
      hasUser: !!user,
      hasProfile: !!profile,
      userRole: profile ? getUserRoleName(profile) : 'none',
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

  // Se há usuário mas não há perfil, aguardar um pouco mais
  if (user && !profile) {
    return <LoadingScreen message="Carregando perfil..." />;
  }

  // Obter role do usuário
  const userRole = getUserRoleName(profile);

  // Verificar permissão de admin
  if (level === 'admin' && userRole !== 'admin') {
    toast.error("Você não tem permissão para acessar esta área administrativa");
    return <Navigate to={fallbackPath} replace />;
  }

  // Verificar permissão de formação (admin ou formacao)
  if (level === 'formacao' && !(userRole === 'admin' || userRole === 'formacao')) {
    toast.error("Você não tem permissão para acessar esta área de formação");
    return <Navigate to={fallbackPath} replace />;
  }

  // Para rotas 'authenticated', aceitar qualquer usuário logado com perfil válido
  // Isso inclui: admin, formacao, membro_club, etc.
  if (level === 'authenticated' && user && profile) {
    return <>{children}</>;
  }

  // Se chegou até aqui e tem usuário com perfil, permitir acesso
  if (user && profile) {
    return <>{children}</>;
  }

  // Fallback para casos não cobertos
  logger.warn("[ROUTE-PROTECTION] Caso não coberto, redirecionando para login");
  return <Navigate to="/login" replace />;
};
