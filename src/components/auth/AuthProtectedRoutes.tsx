
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import LoadingScreen from "@/components/common/LoadingScreen";

interface AuthProtectedRoutesProps {
  children: ReactNode;
}

const AuthProtectedRoutes = ({ children }: AuthProtectedRoutesProps) => {
  const { user, isLoading } = useSimpleAuth();
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
