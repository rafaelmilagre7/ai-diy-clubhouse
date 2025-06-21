
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import LoadingScreen from "@/components/common/LoadingScreen";

const RootRedirect = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  
  console.log("[ROOT-REDIRECT] Estado:", {
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading,
    onboardingLoading,
    onboardingRequired,
    userEmail: user?.email,
    profileOnboardingCompleted: profile?.onboarding_completed
  });
  
  // Aguardar o carregamento completo de auth e onboarding
  if (authLoading || onboardingLoading) {
    return <LoadingScreen message="Verificando seu acesso..." />;
  }
  
  // Se não há usuário, ir para login
  if (!user) {
    console.log("[ROOT-REDIRECT] Sem usuário -> login");
    return <Navigate to="/login" replace />;
  }
  
  // Se há usuário mas ainda não carregou perfil, aguardar
  if (user && !profile) {
    console.log("[ROOT-REDIRECT] Usuário sem perfil, aguardando...");
    return <LoadingScreen message="Carregando perfil..." />;
  }
  
  // LÓGICA CRÍTICA: FORÇAR onboarding para TODOS que não completaram
  if (onboardingRequired) {
    console.log("[ROOT-REDIRECT] ONBOARDING OBRIGATÓRIO -> /onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Apenas depois de completar onboarding, redirecionar para áreas da plataforma
  if (profile?.user_roles?.name === 'formacao') {
    console.log("[ROOT-REDIRECT] Formação com onboarding completo -> /formacao");
    return <Navigate to="/formacao" replace />;
  }
  
  // Padrão -> dashboard (apenas se onboarding foi completado)
  console.log("[ROOT-REDIRECT] Usuário com onboarding completo -> dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
