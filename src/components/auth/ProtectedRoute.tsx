
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
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
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  
  // Debug logs
  useEffect(() => {
    console.log("ProtectedRoute:", { 
      user: !!user, // Logamos apenas a existência do usuário, não seus dados
      isAdmin, 
      isLoading, 
      requireAdmin, 
      requiredRole, 
      path: location.pathname 
    });
  }, [user, isAdmin, isLoading, requireAdmin, requiredRole, location.pathname]);
  
  // Se não houver usuário autenticado após verificação, redireciona para login
  if (!isLoading && !user) {
    console.log("ProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Verificar com base em requiredRole ou requireAdmin após verificação
  if (!isLoading && user && ((requiredRole === 'admin' || requireAdmin) && !isAdmin)) {
    console.log("Usuário não é admin, redirecionando para dashboard");
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Renderização otimista - sempre mostra o conteúdo enquanto verifica a autenticação
  return <>{children}</>;
};

export default ProtectedRoute;
