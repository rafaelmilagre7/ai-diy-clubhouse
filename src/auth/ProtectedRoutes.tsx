
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const hasToastShown = useRef(false);
  const navigationCountRef = useRef<Record<string, number>>({});

  console.log("ProtectedRoutes: verificando rota", {
    path: location.pathname,
    user: !!user,
    isLoading, 
    loadingTimeout
  });
  
  // Detectar possíveis loops de navegação
  useEffect(() => {
    // Incrementar contador para este caminho
    navigationCountRef.current[location.pathname] = 
      (navigationCountRef.current[location.pathname] || 0) + 1;
    
    // Verificar possíveis loops
    if (navigationCountRef.current[location.pathname] > 5) {
      console.error(`ProtectedRoutes: Possível loop de navegação para ${location.pathname} (${navigationCountRef.current[location.pathname]} navegações)`);
      
      // Limpar contador após detectar um possível loop
      navigationCountRef.current = {};
    }
    
    // Limpar contadores antigos após 10 segundos
    const cleanupTimeout = setTimeout(() => {
      navigationCountRef.current = {};
    }, 10000);
    
    return () => {
      clearTimeout(cleanupTimeout);
    };
  }, [location.pathname]);
  
  // Configurar timeout de carregamento
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      // Limpar qualquer timeout existente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        console.log("ProtectedRoutes: Loading timeout exceeded");
        setLoadingTimeout(true);
      }, 5000); // Aumentado para 5 segundos
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
    // Exibir toast apenas uma vez
    if (!hasToastShown.current) {
      toast("Por favor, faça login para acessar esta página");
      hasToastShown.current = true;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Usuário está autenticado, renderizar as rotas protegidas
  return <>{children}</>;
};
