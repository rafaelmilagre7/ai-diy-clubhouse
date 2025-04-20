
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

export const AdminProtectedRoutes = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  // Se o usuário não estiver autenticado, redireciona para a página de login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o usuário não for administrador, redireciona para o dashboard
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Usuário é administrador, renderiza as rotas protegidas
  return <Outlet />;
};
