
import { Navigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import LoadingScreen from "@/components/common/LoadingScreen";

const RootRedirect = () => {
  const { user, profile, isLoading: authLoading } = useSimpleAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  
  console.log("[ROOT-REDIRECT] Estado:", {
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading,
    onboardingLoading,
    onboardingRequired
  });
  
  // Loading simples - sem verificações complexas
  if (authLoading || onboardingLoading) {
    return <LoadingScreen message="Verificando seu acesso..." />;
  }
  
  // CORRIGIDO: Sem usuário = login (NOVO PADRÃO: /login)
  if (!user) {
    console.log("[ROOT-REDIRECT] Sem usuário -> login");
    return <Navigate to="/login" replace />;
  }
  
  // Sem perfil = aguardar (mas sem complexidade)
  if (user && !profile) {
    console.log("[ROOT-REDIRECT] Aguardando perfil...");
    return <LoadingScreen message="Carregando perfil..." />;
  }
  
  // Onboarding obrigatório = onboarding
  if (onboardingRequired) {
    console.log("[ROOT-REDIRECT] Onboarding obrigatório -> /onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Formação = área específica
  if (profile?.user_roles?.name === 'formacao') {
    console.log("[ROOT-REDIRECT] Formação -> /formacao");
    return <Navigate to="/formacao" replace />;
  }
  
  // Padrão = dashboard
  console.log("[ROOT-REDIRECT] Dashboard padrão");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
