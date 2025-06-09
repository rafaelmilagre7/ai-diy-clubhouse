
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { SecurityProvider } from "@/contexts/auth/SecurityContext";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const toastShownRef = useRef(false);
  const mountedRef = useRef(false);
  
  // Sistema de timeout otimizado para 5 segundos
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (isLoading && !loadingTimeout && mountedRef.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Timeout reduzido para 5 segundos
      timeoutRef.current = window.setTimeout(() => {
        if (mountedRef.current) {
          setLoadingTimeout(true);
          logger.warn("Auth loading timeout exceeded", {
            component: 'PROTECTED_ROUTES',
            timeoutDuration: '5000ms',
            location: location.pathname
          });
        }
      }, 5000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout, location.pathname]);

  // Mostrar loading com timeout melhorado
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando credenciais..." showProgress={true} />;
  }

  // Timeout de carregamento - redirecionar com informação de contexto
  if (loadingTimeout) {
    if (!toastShownRef.current) {
      toast.error("Tempo limite excedido. Redirecionando...");
      toastShownRef.current = true;
    }
    
    logger.error("Authentication timeout - redirecting to login", {
      location: location.pathname,
      timeout: true
    });
    
    return <Navigate to="/login" replace />;
  }

  // Redirecionar para login se não autenticado
  if (!user) {
    const returnPath = location.pathname !== "/login" ? location.pathname : "/dashboard";
    
    if (!toastShownRef.current) {
      toast.info("Acesso restrito. Faça login para continuar.");
      toastShownRef.current = true;
    }
    
    return <Navigate to="/login" state={{ from: returnPath }} replace />;
  }

  // Usuário autenticado - renderizar conteúdo protegido
  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
};
