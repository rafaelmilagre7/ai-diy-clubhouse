
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import LoadingScreen from "@/components/common/LoadingScreen";

const RootRedirect = () => {
  const { user, profile, isLoading: authLoading, isAdmin } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  
  console.log("[ROOT-REDIRECT] Estado:", {
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading,
    onboardingLoading,
    onboardingRequired,
    isAdmin,
    userEmail: user?.email
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
  
  // LÓGICA CRÍTICA: Verificar se precisa fazer onboarding
  if (onboardingRequired) {
    console.log("[ROOT-REDIRECT] Onboarding necessário -> /onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Se admin e onboarding já foi feito (ou não é necessário), ir para dashboard
  if (isAdmin) {
    console.log("[ROOT-REDIRECT] Admin com onboarding completo -> dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Usuários de formação
  if (profile?.user_roles?.name === 'formacao') {
    console.log("[ROOT-REDIRECT] Formação -> /formacao");
    return <Navigate to="/formacao" replace />;
  }
  
  // Padrão -> dashboard (apenas se onboarding foi completado)
  console.log("[ROOT-REDIRECT] Usuário padrão com onboarding completo -> dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
