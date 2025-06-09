
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";
import { logger } from "@/utils/logger";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [accessChecked, setAccessChecked] = useState(false);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Verificar acesso com fallbacks seguros
  useEffect(() => {
    // Limpar timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Se estiver carregando, configurar timeout menor
    if (isLoading && !accessChecked) {
      timeoutRef.current = window.setTimeout(() => {
        logger.warn("ProtectedRoute timeout - usando fallback", {
          component: 'PROTECTED_ROUTE',
          hasUser: !!user,
          requireAdmin
        });
        setFallbackTriggered(true);
        
        // Fallback baseado no estado atual
        if (!user) {
          navigate('/login', { replace: true });
        } else if (requireAdmin && !isAdmin) {
          navigate('/dashboard', { replace: true });
        } else {
          setAccessChecked(true);
        }
      }, 1500); // 1.5 segundos de timeout
    }
    // Se não estiver carregando, verificar acesso
    else if (!isLoading && !accessChecked && !fallbackTriggered) {
      if (!user) {
        logger.info("ProtectedRoute - usuário não autenticado", {
          component: 'PROTECTED_ROUTE'
        });
        navigate('/login', { replace: true });
        return;
      }
      
      if (requireAdmin && !isAdmin) {
        logger.info("ProtectedRoute - acesso admin negado", {
          component: 'PROTECTED_ROUTE',
          userRole: user?.user_metadata?.role
        });
        navigate('/dashboard', { replace: true });
        return;
      }
      
      // Acesso verificado e permitido
      setAccessChecked(true);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, isAdmin, isLoading, accessChecked, requireAdmin, navigate, fallbackTriggered]);

  // Mostrar loading enquanto verifica acesso
  if ((isLoading || !accessChecked) && !fallbackTriggered) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Verificando sua autenticação..." />
      </PageTransitionWithFallback>
    );
  }

  // Renderizar apenas se acesso foi verificado ou fallback ativado
  return <>{children}</>;
};

export default ProtectedRoute;
