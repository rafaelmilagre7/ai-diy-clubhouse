
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import LoadingScreen from "@/components/common/LoadingScreen";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  
  const authContext = useAuth();
  const { user, profile, isAdmin, isLoading: authLoading } = authContext;
  const { isRequired: onboardingRequired, isLoading: onboardingLoading, hasCompleted } = useOnboardingStatus();
  
  console.log("[ROOT-REDIRECT] Estado:", {
    currentPath: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    isAdmin,
    authLoading,
    onboardingRequired,
    onboardingLoading
  });
  
  // Se estiver carregando, mostrar loading
  if (authLoading || onboardingLoading) {
    console.log("[ROOT-REDIRECT] Aguardando carregamento...");
    return <LoadingScreen message="Carregando..." />;
  }
  
  // Se não há usuário, ir para login
  if (!user) {
    console.log("[ROOT-REDIRECT] Sem usuário - redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  // Verificação de roles mais simples
  const roleName = getUserRoleName(profile);
  
  // Se é formação, ir para formação
  if (roleName === 'formacao') {
    console.log("[ROOT-REDIRECT] Formação detectado");
    return <Navigate to="/formacao" replace />;
  }
  
  // Se precisa de onboarding
  if (onboardingRequired && !hasCompleted) {
    console.log("[ROOT-REDIRECT] Onboarding necessário");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Caso padrão - sempre dashboard (incluindo admin)
  console.log("[ROOT-REDIRECT] Redirecionamento padrão para dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
