
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

/**
 * AuthGuard - Proteção básica de rotas autenticadas
 * Verificar se o usuário está logado para acessar as rotas protegidas
 */
const AuthGuard = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [showLoading, setShowLoading] = useState(true);
  
  // Timer para não mostrar loading por muito tempo
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      timer = setTimeout(() => {
        setShowLoading(false);
      }, 2000);
    } else {
      setShowLoading(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);
  
  // Debug log
  console.log("AuthGuard:", { user, isLoading, path: location.pathname });
  
  // Se estiver carregando, mostrar loading screen
  if (isLoading && showLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }
  
  // Se não estiver autenticado, redirecionar para login
  if (!user) {
    toast("Por favor, faça login para acessar esta página");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Se estiver autenticado, permitir acesso
  return <Outlet />;
};

export default AuthGuard;
