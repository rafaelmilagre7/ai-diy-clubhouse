
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface AdminProtectedRoutesProps {
  children: ReactNode;
}

export const AdminProtectedRoutes = ({ children }: AdminProtectedRoutesProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  
  // Debug log
  useEffect(() => {
    console.log("AdminProtectedRoutes state:", { 
      user: !!user, 
      isAdmin, 
      isLoading, 
      path: location.pathname 
    });
  }, [user, isAdmin, isLoading, location.pathname]);

  // Se o usuário não estiver autenticado após verificação, redireciona para login
  if (!isLoading && !user) {
    console.log("AdminProtectedRoutes: Não autenticado, redirecionando para login");
    toast.error("Por favor, faça login para acessar esta página");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o usuário não for administrador após verificação, redireciona para dashboard
  if (!isLoading && user && !isAdmin) {
    console.log("AdminProtectedRoutes: Usuário não é admin, redirecionando para dashboard");
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Renderização otimista - sempre renderiza o conteúdo enquanto verifica a autenticação
  return <>{children}</>;
};
