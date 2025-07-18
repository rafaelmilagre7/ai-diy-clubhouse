import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute garante que apenas usuários autenticados tenham acesso
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log("🔒 [PROTECTED-ROUTE] Estado:", { 
    hasUser: !!user, 
    isLoading, 
    pathname: location.pathname 
  });

  if (isLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  if (!user) {
    console.log("↩️ [PROTECTED-ROUTE] Redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;