
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  const { user, profile, isLoading } = useAuth();
  
  console.log("🔍 [ROOT-REDIRECT] Estado:", {
    path: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    isLoading
  });

  // Ainda carregando - mostrar loading apenas por tempo limitado
  if (isLoading) {
    return <LoadingScreen message="Verificando sessão" showProgress />;
  }

  // Sem usuário = login
  if (!user) {
    console.log("🔄 [ROOT-REDIRECT] Sem usuário - redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Usuário logado mas ainda sem perfil - aguardar um pouco mais
  if (user && !profile) {
    console.log("⏳ [ROOT-REDIRECT] Aguardando perfil...");
    return <LoadingScreen message="Carregando seu perfil..." />;
  }

  // CRÍTICO: Verificar se usuário precisa fazer onboarding
  if (user && profile && profile.onboarding_completed === false) {
    console.log("📝 [ROOT-REDIRECT] Usuário precisa fazer onboarding - redirecionando");
    return <Navigate to="/onboarding" replace />;
  }

  // VERIFICAÇÃO ADICIONAL: Se onboarding_completed é null ou undefined, também redirecionar
  if (user && profile && profile.onboarding_completed !== true) {
    console.log("⚠️ [ROOT-REDIRECT] Onboarding não confirmado como completo - redirecionando");
    return <Navigate to="/onboarding" replace />;
  }

  // Usuário logado tentando acessar login
  if (location.pathname === '/login' && user && profile) {
    const targetRoute = getUserRoleName(profile) === 'formacao' 
      ? '/formacao' 
      : '/dashboard';
    console.log("✅ [ROOT-REDIRECT] Usuário logado - redirecionando para", targetRoute);
    return <Navigate to={targetRoute} replace />;
  }

  // Redirecionamento padrão para root
  if (location.pathname === '/' && user && profile) {
    const targetRoute = getUserRoleName(profile) === 'formacao' 
      ? '/formacao' 
      : '/dashboard';
    console.log("🔄 [ROOT-REDIRECT] Root redirect para", targetRoute);
    return <Navigate to={targetRoute} replace />;
  }

  // Fallback para dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
