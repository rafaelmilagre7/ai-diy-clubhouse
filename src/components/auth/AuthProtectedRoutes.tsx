
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface AuthProtectedRoutesProps {
  children: ReactNode; // Propriedade children é obrigatória
}

/**
 * AuthProtectedRoutes protege rotas que requerem autenticação básica
 * 
 * IMPORTANTE: Este componente SEMPRE deve ser usado envolvendo um componente filho:
 * <AuthProtectedRoutes>
 *   <SeuComponente />
 * </AuthProtectedRoutes>
 */
const AuthProtectedRoutes = ({ children }: AuthProtectedRoutesProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Se o usuário não estiver autenticado após carregamento, redireciona para login
  if (!isLoading && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Renderiza sempre (mesmo durante carregamento para UX otimista)
  return <>{children}</>;
};

export default AuthProtectedRoutes;
