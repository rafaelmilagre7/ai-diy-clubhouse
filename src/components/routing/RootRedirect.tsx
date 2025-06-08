
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import LoadingScreen from "@/components/common/LoadingScreen";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  const navigate = useNavigate();
  
  console.log('[RootRedirect] Estado:', {
    authLoading,
    onboardingLoading,
    user: !!user,
    profile: !!profile,
    onboardingRequired,
    isAdmin
  });
  
  // Se ainda carregando, mostrar loading
  if (authLoading || onboardingLoading) {
    return <LoadingScreen message="Carregando..." />;
  }
  
  // Se não tem usuário, redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Se tem usuário mas precisa de onboarding
  if (user && onboardingRequired) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Se é admin, ir para admin
  if (profile?.role === 'admin' || isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  // Caso padrão: dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
