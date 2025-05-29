
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import { useSimpleOnboardingValidation } from '@/hooks/onboarding/useSimpleOnboardingValidation';
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRole?: string;
  requireOnboarding?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requiredRole,
  requireOnboarding = true
}: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useSimpleOnboardingValidation();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);
  
  // Configurar timeout para não ficar preso em carregamento infinito
  useEffect(() => {
    if ((authLoading || onboardingLoading) && !loadingTimeout) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        setLoadingTimeout(true);
        toast("Tempo limite de carregamento excedido, redirecionando para login");
      }, 3000); // 3 segundos de timeout
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [authLoading, onboardingLoading, loadingTimeout]);

  // Se estiver carregando, mostra tela de loading (mas só se o timeout não foi excedido)
  if ((authLoading || onboardingLoading) && !loadingTimeout) {
    return <LoadingScreen message="Verificando sua autenticação..." />;
  }

  // Se não houver usuário autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Verificar com base em requiredRole ou requireAdmin
  if ((requiredRole === 'admin' || requireAdmin) && !isAdmin) {
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar onboarding se necessário
  if (requireOnboarding && !isOnboardingComplete && !location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding-new" replace />;
  }

  // Usuário está autenticado, renderiza os filhos
  return <>{children}</>;
};

export default ProtectedRoute;
