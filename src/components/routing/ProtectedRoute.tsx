
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRole?: string; // Adicionando suporte para requiredRole também
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requiredRole
}: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  
  // Adicionando mais informações de debug
  console.log("ProtectedRoute:", { user, isAdmin, isLoading, requireAdmin, requiredRole, path: location.pathname });
  
  // Show loading screen during the loading state
  if (isLoading) {
    return <LoadingScreen message="Verificando sua autenticação..." />;
  }

  // Redirect to auth if no user
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Verificar com base em requiredRole ou requireAdmin
  if ((requiredRole === 'admin' || requireAdmin) && !isAdmin) {
    console.log("Usuário não é admin, redirecionando para dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
