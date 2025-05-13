
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

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
  const timeoutRef = useRef<number | null>(null);
  
  // Depuração e diagnóstico
  console.log("ProtectedRoute:", {
    user: !!user,
    isAdmin,
    isLoading,
    accessChecked
  });
  
  // Verificar acesso apenas quando o estado de autenticação estiver pronto
  useEffect(() => {
    // Limpar timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Se estiver carregando, configurar timeout
    if (isLoading) {
      timeoutRef.current = window.setTimeout(() => {
        console.log("ProtectedRoute: Loading timeout exceeded");
        
        // Redirecionar para login se timeout excedido
        navigate('/login', { replace: true });
      }, 2000); // 2 segundos de timeout
    }
    // Se não estiver carregando, verificar acesso
    else if (!accessChecked) {
      console.log("ProtectedRoute: Verificando acesso");
      
      if (!user) {
        console.log("ProtectedRoute: No user, redirecting to auth");
        navigate('/auth', { replace: true });
        return;
      }
      
      if (requireAdmin && !isAdmin) {
        console.log("ProtectedRoute: User is not admin, redirecting to dashboard");
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
  }, [user, isAdmin, isLoading, accessChecked, requireAdmin, navigate]);

  // Mostrar loading enquanto verifica acesso
  if (isLoading || !accessChecked) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Verificando sua autenticação..." />
      </PageTransitionWithFallback>
    );
  }

  // Renderizar apenas se acesso foi verificado
  return <>{children}</>;
};

export default ProtectedRoute;
