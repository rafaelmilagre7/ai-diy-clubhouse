
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

interface AdminProtectedRoutesProps {
  children: ReactNode;
}

/**
 * AdminProtectedRoutes protege rotas que requerem privilégios de administrador
 */
const AdminProtectedRoutes = ({ children }: AdminProtectedRoutesProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Verificando permissões de administrador..." />;
  }

  if (!user) {
    console.log("⚠️ [ADMIN-PROTECTED] Usuário não autenticado - redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    console.log("⚠️ [ADMIN-PROTECTED] Usuário não é admin - redirecionando para dashboard");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoutes;
