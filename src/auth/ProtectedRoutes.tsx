
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

interface ProtectedRoutesProps {
  children: ReactNode;
}

/**
 * Componente básico de proteção de rotas mantido para compatibilidade
 * Recomenda-se usar AuthenticatedRoute para novos desenvolvimentos
 */
export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const hasToastShown = useRef(false);

  console.log("ProtectedRoutes (legacy): verificando rota", {
    path: location.pathname,
    user: !!user,
    isLoading, 
    loadingTimeout
  });
  
  // Configurar timeout de carregamento
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      // Limpar qualquer timeout existente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        console.log("ProtectedRoutes (legacy): Loading timeout exceeded");
        setLoadingTimeout(true);
      }, 3000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout]);

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  // Se o usuário não estiver autenticado, redireciona para a página de login
  if (!user) {
    // Salvar a rota atual para redirecionamento após login
    const returnPath = location.pathname !== "/login" ? location.pathname : "/dashboard";
    console.log(`ProtectedRoutes (legacy): Usuário não autenticado, redirecionando para login (retorno: ${returnPath})`);
    
    // Exibir toast apenas uma vez
    if (!hasToastShown.current) {
      toast("Por favor, faça login para acessar esta página");
      hasToastShown.current = true;
    }
    
    // Passar a rota atual como estado para redirecionamento após login
    return <Navigate to="/login" state={{ from: returnPath }} replace />;
  }

  // Usuário está autenticado, renderizar as rotas protegidas
  return <>{children}</>;
};
