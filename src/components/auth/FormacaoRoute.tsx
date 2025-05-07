
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

interface FormacaoRouteProps {
  children: ReactNode;
}

const FormacaoRoute = ({ children }: FormacaoRouteProps) => {
  const { user, isFormacao, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Efeito para debug
  useEffect(() => {
    console.log("FormacaoRoute:", { user, isFormacao, isAdmin, isLoading, path: location.pathname });
  }, [user, isFormacao, isAdmin, isLoading, location]);

  // Se estiver carregando, mostra tela de loading
  if (isLoading) {
    return <LoadingScreen message="Verificando permissões de formação..." />;
  }

  // Verifica se o usuário está autenticado
  if (!user) {
    toast.error("Você precisa fazer login para acessar esta área");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica se o usuário tem permissão de formação ou é administrador
  if (!isFormacao && !isAdmin) {
    toast.error("Você não tem acesso à área de formação");
    return <Navigate to="/dashboard" replace />;
  }

  // Se passou por todas as verificações, renderiza os filhos
  return <>{children}</>;
};

export default FormacaoRoute;
