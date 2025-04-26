
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  console.log("ProtectedRoutes state:", { user, isLoading });

  // Se o usuário não estiver autenticado após verificação, redireciona para a página de login
  if (!isLoading && !user) {
    toast("Por favor, faça login para acessar esta página");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Renderiza as rotas protegidas (mesmo durante carregamento para UX otimista)
  return <>{children}</>;
};
