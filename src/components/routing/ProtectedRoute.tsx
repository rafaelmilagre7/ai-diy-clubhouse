
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
  const { user, profile, isAdmin, hasCompletedOnboarding, isLoading } = useAuth();
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

  // Se usuário não completou onboarding E não está em rota permitida
  if (!hasCompletedOnboarding && !isOnboardingRoute) {
    console.log("[PROTECTED-ROUTE] Onboarding obrigatório não completado, redirecionando...", {
      hasProfile: !!profile,
      profileId: profile?.id,
      onboardingCompleted: profile?.onboarding_completed,
      currentPath: location.pathname
    });
    
    // Fallback: Se não há perfil mas há usuário, dar mais tempo
    if (user && !profile) {
      console.log("[PROTECTED-ROUTE] Aguardando criação do perfil...");
      return <LoadingScreen message="Configurando sua conta..." />;
    }
    
    // Redirecionar para onboarding
    return <Navigate to="/onboarding" replace />;
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
