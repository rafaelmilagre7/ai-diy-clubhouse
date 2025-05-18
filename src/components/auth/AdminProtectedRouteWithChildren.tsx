
import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

interface AdminProtectedRouteWithChildrenProps {
  children: React.ReactNode;
}

/**
 * Versão do AdminProtectedRoute que aceita children diretamente
 * Para ser usado nos arquivos de rota AdminRoutes
 */
const AdminProtectedRouteWithChildren = ({ children }: AdminProtectedRouteWithChildrenProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);
  
  // Debug logs
  console.log("AdminProtectedRouteWithChildren:", { 
    user, 
    isAdmin, 
    isLoading,
    path: location.pathname 
  });
  
  // Configurar timeout para não ficar preso em carregamento infinito
  React.useEffect(() => {
    if (isLoading && !loadingTimeout) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        console.log("AdminProtectedRouteWithChildren: Loading timeout exceeded");
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
    return <LoadingScreen message="Verificando permissões de administrador..." />;
  }

  // Se não houver usuário autenticado, redireciona para login
  if (!user) {
    console.log("AdminProtectedRouteWithChildren: No user, redirecting to login");
    toast.error("Por favor, faça login para acessar esta área");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Verificar se o usuário é admin
  if (!isAdmin) {
    console.log("Usuário não é admin, redirecionando para dashboard");
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Usuário está autenticado e é admin, renderiza os filhos
  return <>{children}</>;
};

export default AdminProtectedRouteWithChildren;
