
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState } from "react";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);
  
  // CORREÇÃO: Verificação segura do contexto sem try/catch complexo
  const authContext = useAuth();
  const { user, profile, isAdmin, isLoading: authLoading } = authContext;
  const { isRequired: onboardingRequired, isLoading: onboardingLoading, hasCompleted } = useOnboardingStatus();
  
  console.log("[ROOT-REDIRECT] Estado simples:", {
    currentPath: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    isAdmin,
    authLoading,
    onboardingRequired,
    onboardingLoading,
    hasRedirected
  });
  
  // CORREÇÃO: Timeout simplificado de 5 segundos apenas
  useEffect(() => {
    if (!hasRedirected) {
      const timeout = setTimeout(() => {
        console.log("⚠️ [ROOT REDIRECT] Timeout de 5s - forçando redirecionamento");
        setHasRedirected(true);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [hasRedirected]);
  
  // CORREÇÃO: Se já redirecionou por timeout, ir direto pro dashboard
  if (hasRedirected && !authLoading && !onboardingLoading) {
    console.log("🚨 [ROOT REDIRECT] Redirecionamento forçado - indo para dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
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
  
  // CORREÇÃO: Verificação de roles mais simples
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
  
  // CORREÇÃO: Caso padrão - sempre dashboard (incluindo admin)
  console.log("[ROOT-REDIRECT] Redirecionamento padrão para dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
