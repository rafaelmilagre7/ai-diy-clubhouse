
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
  const [securityChecked, setSecurityChecked] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const toastShownRef = useRef(false);
  const mountedRef = useRef(false);
  
  // Rastrear tentativas de acesso para segurança
  const accessAttemptRef = useRef<{
    count: number;
    lastAttempt: number;
    blocked: boolean;
  }>({
    count: 0,
    lastAttempt: 0,
    blocked: false
  });

  // Montar componente
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Sistema de timeout de segurança
  useEffect(() => {
    if (isLoading && !loadingTimeout && mountedRef.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        if (mountedRef.current) {
          setLoadingTimeout(true);
          console.warn("[SECURITY] Auth loading timeout exceeded");
        }
      }, 6000); // 6 segundos de timeout
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout]);

  // Verificação de segurança e controle de acesso
  useEffect(() => {
    if (!mountedRef.current) return;

    const now = Date.now();
    const attempt = accessAttemptRef.current;
    
    // Verificar se há muitas tentativas de acesso (proteção contra ataques)
    if (now - attempt.lastAttempt < 1000) {
      attempt.count++;
      if (attempt.count > 10) {
        attempt.blocked = true;
        console.error("[SECURITY] Too many access attempts - temporarily blocked");
        toast.error("Muitas tentativas de acesso. Aguarde um momento.");
        return;
      }
    } else {
      attempt.count = 0;
      attempt.blocked = false;
    }
    
    attempt.lastAttempt = now;

    if (!isLoading && !securityChecked) {
      setSecurityChecked(true);
      
      if (!user) {
        // Log de tentativa de acesso não autorizada (sem dados sensíveis)
        console.warn("[SECURITY] Unauthorized access attempt", {
          path: location.pathname,
          timestamp: new Date().toISOString(),
          referrer: document.referrer || 'direct'
        });
      }
    }
  }, [user, isLoading, location.pathname, securityChecked]);

  // Mostrar loading enquanto verifica autenticação
  if ((isLoading && !loadingTimeout) || accessAttemptRef.current.blocked) {
    return <LoadingScreen message="Verificando credenciais de segurança..." />;
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
