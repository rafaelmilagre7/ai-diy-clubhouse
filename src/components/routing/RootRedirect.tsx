
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
  // CORREÇÃO: Só redirecionar se onboarding_completed for explicitamente false
  if (user && profile && profile.onboarding_completed === false) {
    // NOVA VERIFICAÇÃO: Se acabou de completar onboarding, aguardar sincronização
    const justCompletedFlag = sessionStorage.getItem('onboarding_just_completed');
    
    if (justCompletedFlag === 'true') {
      console.log("⏳ [ROOT-REDIRECT] Onboarding recém-completado - aguardando sincronização do cache");
      
      // Remover flag para evitar loop infinito
      sessionStorage.removeItem('onboarding_just_completed');
      console.log("🗑️ [ROOT-REDIRECT] Flag removida do sessionStorage");
      
      // Mostrar loading enquanto o cache sincroniza
      // Isso dá tempo para a sincronização blocante do useOnboarding completar
      return <LoadingScreen message="Finalizando configuração..." showProgress />;
    }
    
    console.log("📝 [ROOT-REDIRECT] Usuário precisa fazer onboarding - redirecionando");
    return <Navigate to="/onboarding" replace />;
  }

  // Se o onboarding_completed for null/undefined, verificar no banco antes de redirecionar
  if (user && profile && profile.onboarding_completed == null) {
    console.log("⚠️ [ROOT-REDIRECT] Onboarding status indefinido - permanecendo na rota atual");
    // Não redirecionar automaticamente, deixar o usuário na rota atual
  }

  // Usuário logado tentando acessar login
  if (location.pathname === '/login' && user && profile) {
    // Verificar onboarding primeiro - só redirecionar se explicitamente false
    if (profile.onboarding_completed === false) {
      console.log("📝 [ROOT-REDIRECT] Usuário no login precisa completar onboarding");
      return <Navigate to="/onboarding" replace />;
    }

    // CORREÇÃO: Todos usuários vão para dashboard
    const targetRoute = '/dashboard';
    console.log("✅ [ROOT-REDIRECT] Usuário logado - redirecionando para", targetRoute);
    return <Navigate to={targetRoute} replace />;
  }

  // Redirecionamento padrão para root
  if (location.pathname === '/' && user && profile) {
    // Verificar onboarding primeiro - só redirecionar se explicitamente false
    if (profile.onboarding_completed === false) {
      console.log("📝 [ROOT-REDIRECT] Usuário na root precisa completar onboarding");
      return <Navigate to="/onboarding" replace />;
    }

    // CORREÇÃO: Todos usuários vão para dashboard
    const targetRoute = '/dashboard';
    console.log("🔄 [ROOT-REDIRECT] Root redirect para", targetRoute);
    return <Navigate to={targetRoute} replace />;
  }

  // Fallback para dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
