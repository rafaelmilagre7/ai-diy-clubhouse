
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [securityChecked, setSecurityChecked] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const toastShownRef = useRef(false);
  const mountedRef = useRef(false);
  
  // Sistema de timeout de segurança reduzido
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
      
      // Timeout reduzido para 3 segundos
      timeoutRef.current = window.setTimeout(() => {
        if (mountedRef.current) {
          setLoadingTimeout(true);
          logger.warn("Auth loading timeout exceeded", {
            component: 'PROTECTED_ROUTES'
          });
        }
      }, 3000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout]);

  // Verificação de segurança otimizada
  useEffect(() => {
    if (!mountedRef.current) return;

    if (!isLoading && !securityChecked) {
      setSecurityChecked(true);
      
      if (!user) {
        // Log de tentativa de acesso não autorizada (sem dados sensíveis)
        logger.warn("Unauthorized access attempt", {
          path: location.pathname,
          component: 'PROTECTED_ROUTES',
          referrer: document.referrer || 'direct'
        });
      }
    }
  }, [user, isLoading, location.pathname, securityChecked]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando credenciais..." showProgress={true} />;
  }

  // Timeout de carregamento excedido
  if (loadingTimeout) {
    if (!toastShownRef.current) {
      toast.error("Tempo limite de autenticação excedido. Redirecionando para login.");
      toastShownRef.current = true;
    }
    return <Navigate to="/login" replace />;
  }

  // Redirecionar para login se não autenticado
  if (!user) {
    const returnPath = location.pathname !== "/login" ? location.pathname : "/dashboard";
    
    if (!toastShownRef.current) {
      toast.warning("Por favor, faça login para acessar esta página");
      toastShownRef.current = true;
    }
    
    return <Navigate to="/login" state={{ from: returnPath }} replace />;
  }

  // Usuário autenticado - renderizar conteúdo protegido
  return <>{children}</>;
};
