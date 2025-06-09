
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import LoadingScreen from "@/components/common/LoadingScreen";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  
  // Se ainda está carregando autenticação
  if (authLoading) {
    return <LoadingScreen message="Verificando sua sessão..." />;
  }
  
  // Se não há usuário, vai para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Se há usuário mas não há perfil, não pode acessar (problema de dados)
  if (!profile) {
    return <Navigate to="/login" replace />;
  }
  
  // Se ainda está carregando onboarding
  if (onboardingLoading) {
    return <LoadingScreen message="Verificando seu progresso..." />;
  }
  
  // Se precisa de onboarding
  if (onboardingRequired) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Se é admin
  if (isAdmin || profile.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  // Se é formação
  if (profile.role === 'formacao') {
    return <Navigate to="/formacao" replace />;
  }
  
  // Caso padrão: dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
