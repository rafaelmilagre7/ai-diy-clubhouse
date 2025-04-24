
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

const AuthGuard = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [showLoading, setShowLoading] = useState(true);
  
  // Timer para não mostrar loading por muito tempo
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isLoading]);
  
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
