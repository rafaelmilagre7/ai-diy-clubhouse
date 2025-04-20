
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

export const ProtectedRoutes = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  // Se o usuário não estiver autenticado, redireciona para a página de login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Usuário está autenticado, renderiza as rotas protegidas
  return <Outlet />;
};
