
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

  console.log("🔐 [AUTH-PROTECTED] Estado:", {
    hasUser: !!user,
    isLoading,
    currentPath: location.pathname
  });

  if (isLoading) {
    console.log("⏳ [AUTH-PROTECTED] Carregando autenticação...");
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  if (!user) {
    console.log("🚪 [AUTH-PROTECTED] Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("✅ [AUTH-PROTECTED] Usuário autenticado, renderizando conteúdo");
  return <>{children}</>;
};

export default AuthProtectedRoutes;
