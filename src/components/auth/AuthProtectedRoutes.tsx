
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

interface AuthProtectedRoutesProps {
  children: ReactNode;
}

/**
 * AuthProtectedRoutes protege rotas que requerem autenticação básica
 */
const AuthProtectedRoutes = ({ children }: AuthProtectedRoutesProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthProtectedRoutes;
