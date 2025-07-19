
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRole?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requiredRole
}: ProtectedRouteProps) => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  
  // Se estiver carregando, mostra tela de loading com timeout aumentado
  if (isLoading) {
    return <LoadingScreen message="Verificando sua autenticação..." />;
  }

  // Se não houver usuário autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // VERIFICAÇÃO OBRIGATÓRIA DE ONBOARDING
  // Rotas permitidas sem onboarding completo
  const allowedWithoutOnboarding = ['/login', '/onboarding', '/auth'];
  const isOnboardingRoute = allowedWithoutOnboarding.some(route => 
    location.pathname.startsWith(route)
  );

  // Onboarding foi removido - verificação desnecessária
  // Se não há perfil mas há usuário, dar mais tempo para carregar
  if (user && !profile) {
    console.log("[PROTECTED-ROUTE] Aguardando criação do perfil...");
    return <LoadingScreen message="Configurando sua conta..." />;
  }
  
  // Verificar se requer admin e usuário não é admin
  if ((requiredRole === 'admin' || requireAdmin) && !isAdmin) {
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Usuário está autenticado, tem onboarding completo e permissões necessárias
  return <>{children}</>;
};

export default ProtectedRoute;
