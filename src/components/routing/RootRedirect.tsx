
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import LoadingScreen from "@/components/common/LoadingScreen";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  
  console.log('[RootRedirect] Estado:', {
    authLoading,
    onboardingLoading,
    user: !!user,
    profile: !!profile,
    onboardingRequired,
    isAdmin
  });
  
  // Se ainda estiver carregando
  if (authLoading || onboardingLoading) {
    return <LoadingScreen message="Carregando..." />;
  }
  
  // Se não há usuário, vai para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Se há usuário mas sem perfil, vai para dashboard
  if (user && !profile) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se precisa de onboarding
  if (onboardingRequired) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Se é admin
  if (isAdmin || profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  // Caso padrão: dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
