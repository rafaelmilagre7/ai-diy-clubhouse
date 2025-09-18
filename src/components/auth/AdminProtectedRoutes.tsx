
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
  // Usar useAuth de forma defensiva
  let user, isAdmin, isLoading;
  try {
    const authContext = useAuth();
    user = authContext?.user;
    isAdmin = authContext?.isAdmin;
    isLoading = authContext?.isLoading;
  } catch (error) {
    console.log('🛡️ [ADMIN-PROTECTED-COMP] AuthProvider não disponível ainda, mostrando loading');
    return <LoadingScreen message="Inicializando autenticação..." />;
  }
  
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Verificando permissões de administrador..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoutes;
