
import React, { useEffect } from 'react';
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
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);
  
  // Debug logs
  console.log("ProtectedRoute:", { 
    user, 
    isAdmin, 
    isLoading, 
    requireAdmin, 
    requiredRole, 
    path: location.pathname 
  });
  
  // Configurar timeout para não ficar preso em carregamento infinito
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        console.log("ProtectedRoute: Loading timeout exceeded");
        setLoadingTimeout(true);
        toast("Tempo limite de carregamento excedido, redirecionando para login");
      }, 3000); // 3 segundos de timeout
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout]);

  // Se estiver carregando, mostra tela de loading (mas só se o timeout não foi excedido)
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando sua autenticação..." />;
  }

  // Se não houver usuário autenticado, redireciona para login
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Verificar com base em requiredRole ou requireAdmin
  if ((requiredRole === 'admin' || requireAdmin) && !isAdmin) {
    console.log("Usuário não é admin, redirecionando para dashboard");
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Usuário está autenticado, renderiza os filhos
  return <>{children}</>;
};

export default ProtectedRoute;
