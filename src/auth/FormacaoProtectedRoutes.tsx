
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

interface FormacaoProtectedRoutesProps {
  children: ReactNode;
}

export const FormacaoProtectedRoutes = ({ children }: FormacaoProtectedRoutesProps) => {
  const { user, isAdmin, isFormacao, isLoading } = useSimpleAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Configurar timeout de carregamento
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      // Limpar qualquer timeout existente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // 5 segundos para maior tolerância
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout]);

  // Mostrar tela de carregamento enquanto verifica autenticação (mas apenas se o timeout não foi excedido)
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando permissões de acesso..." />;
  }

  // Se o usuário não estiver autenticado, redireciona para a página de login (NOVO PADRÃO: /login)
  if (!user) {
    toast.error("Por favor, faça login para acessar esta página");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o usuário não for admin ou formacao, redireciona para o dashboard
  if (!(isAdmin || isFormacao)) {
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Usuário é admin ou formacao, renderiza as rotas protegidas
  return <>{children}</>;
};
