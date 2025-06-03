
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';
import LoadingScreen from "@/components/common/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRole?: string;
  requireOnboarding?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requiredRole,
  requireOnboarding = false
}: ProtectedRouteProps) => {
  const { user, isAdmin, isFormacao, isLoading: authLoading } = useAuth();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useUnifiedOnboardingValidation();
  const location = useLocation();
  
  // Loading timeout otimizado
  const [showContent, setShowContent] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, authLoading || onboardingLoading ? 3000 : 0);
    
    return () => clearTimeout(timer);
  }, [authLoading, onboardingLoading]);
  
  // Se estiver carregando, mostra tela de loading
  if ((authLoading || onboardingLoading) && !showContent) {
    return <LoadingScreen message="Verificando autenticação..." variant="skeleton" />;
  }

  // Se não houver usuário autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Verificar permissões de admin
  if ((requiredRole === 'admin' || requireAdmin) && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Verificar permissões de formação
  if (requiredRole === 'formacao' && !(isFormacao || isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar onboarding apenas se explicitamente requerido
  if (requireOnboarding && !isOnboardingComplete && !isAdmin && !location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding-new" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
