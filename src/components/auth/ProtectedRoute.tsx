
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Se estiver carregando, mostrar loading
  if (isLoading) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Verificando sua autenticação..." />
      </PageTransitionWithFallback>
    );
  }

  // Se não há usuário, redirecionar para login
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }
  
  // Se requer admin e usuário não é admin, redirecionar para dashboard
  if (requireAdmin && !isAdmin) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;
