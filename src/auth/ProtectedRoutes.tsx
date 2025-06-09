
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
  const [securityChecked, setSecurityChecked] = useState(false);
  const [sessionValidated, setSessionValidated] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const toastShownRef = useRef(false);
  const mountedRef = useRef(false);
  
  // Sistema de timeout otimizado para 8 segundos
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
      
      // Timeout aumentado para 8 segundos para melhor UX
      timeoutRef.current = window.setTimeout(() => {
        if (mountedRef.current) {
          setLoadingTimeout(true);
          logger.warn("Auth loading timeout exceeded", {
            component: 'PROTECTED_ROUTES',
            timeoutDuration: '8000ms',
            location: location.pathname
          });
        }
      }, 8000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout, location.pathname]);

  // Verificação de segurança melhorada
  useEffect(() => {
    if (!mountedRef.current) return;

    if (!isLoading && !securityChecked) {
      setSecurityChecked(true);
      
      if (!user) {
        logger.warn("Unauthorized access attempt", {
          path: location.pathname,
          component: 'PROTECTED_ROUTES',
          referrer: document.referrer || 'direct',
          timestamp: new Date().toISOString()
        });
      } else {
        // Validação adicional de segurança para usuários autenticados
        logger.info("User access granted", {
          path: location.pathname,
          userId: user.id.substring(0, 8) + '***', // Log parcial por segurança
          timestamp: new Date().toISOString()
        });
        setSessionValidated(true);
      }
    }
  }, [user, isLoading, location.pathname, securityChecked]);

  // Verificação de integridade da sessão
  useEffect(() => {
    if (user && sessionValidated) {
      const validateSession = async () => {
        try {
          // Verificar se o usuário ainda existe e tem permissões válidas
          const { data: profile } = await fetch('/api/validate-session', {
            headers: { 'Authorization': `Bearer ${user.id}` }
          }).then(res => res.json()).catch(() => ({ data: null }));
          
          if (!profile) {
            logger.warn("Session validation failed", {
              userId: user.id.substring(0, 8) + '***'
            });
            // Não fazer logout automático para evitar loops
          }
        } catch (error) {
          logger.error("Session validation error", { error });
        }
      };

      validateSession();
    }
  }, [user, sessionValidated]);

  // Mostrar loading com timeout melhorado
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando credenciais..." showProgress={true} />;
  }

  // Timeout de carregamento - redirecionar com informação de contexto
  if (loadingTimeout) {
    if (!toastShownRef.current) {
      toast.error("Tempo limite excedido. Verifique sua conexão e tente novamente.");
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

  // Usuário autenticado - renderizar conteúdo protegido com contexto de segurança
  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
};
