
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import LoadingScreen from "@/components/common/LoadingScreen";

interface AdminProtectedRoutesProps {
  children: ReactNode;
}

const AdminProtectedRoutes = ({ children }: AdminProtectedRoutesProps) => {
  const { user, isAdmin, isLoading } = useSimpleAuth();
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
