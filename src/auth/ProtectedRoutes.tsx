
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

export const ProtectedRoutes = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const hasToastShown = useRef(false);

  console.log("ProtectedRoutes state:", { user, isLoading, loadingTimeout });
  
  // Configurar timeout de carregamento
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      // Limpar qualquer timeout existente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        console.log("ProtectedRoutes: Loading timeout exceeded");
        setLoadingTimeout(true);
      }, 5000); // Aumentado para 5 segundos
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout]);

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  // Se o usuário não estiver autenticado, redireciona para a página de login
  if (!user) {
    // Exibir toast apenas uma vez
    if (!hasToastShown.current) {
      toast("Por favor, faça login para acessar esta página");
      hasToastShown.current = true;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Usuário está autenticado, renderizar as rotas protegidas
  return <Outlet />;
};
