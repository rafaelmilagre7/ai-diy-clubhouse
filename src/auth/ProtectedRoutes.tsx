
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Debug log
  useEffect(() => {
    console.log("ProtectedRoutes state:", { 
      user: !!user, // Logamos apenas a existência do usuário, não seus dados 
      isLoading, 
      path: location.pathname 
    });
  }, [user, isLoading, location.pathname]);

  // Se o usuário não estiver autenticado após verificação, redireciona para a página de login
  if (!isLoading && !user) {
    console.log("ProtectedRoutes: Não autenticado, redirecionando para login");
    toast("Por favor, faça login para acessar esta página");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Sempre renderiza o conteúdo (renderização otimista), a verificação de autenticação
  // acontece em background e o redirecionamento ocorrerá quando necessário
  return <>{children}</>;
};
