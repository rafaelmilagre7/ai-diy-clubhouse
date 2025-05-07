
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Efeito para debug
  useEffect(() => {
    console.log("AdminRoute:", { user, isAdmin, isLoading, path: location.pathname });
  }, [user, isAdmin, isLoading, location]);

  // Se estiver carregando, mostra tela de loading
  if (isLoading) {
    return <LoadingScreen message="Verificando permissões de administrador..." />;
  }

  // Verifica se o usuário está autenticado
  if (!user) {
    toast.error("Você precisa fazer login para acessar esta área");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica se o usuário é administrador
  if (!isAdmin) {
    toast.error("Você não tem permissões de administrador");
    return <Navigate to="/dashboard" replace />;
  }

  // Se passou por todas as verificações, renderiza os filhos
  return <>{children}</>;
};

export default AdminRoute;
