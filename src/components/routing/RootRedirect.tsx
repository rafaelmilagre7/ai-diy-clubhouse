
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState, useRef } from "react";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  const [forceRedirect, setForceRedirect] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Timeout absoluto para evitar loading infinito
  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      console.warn("⚠️ [ROOT REDIRECT] Timeout atingido, forçando redirecionamento");
      setForceRedirect(true);
    }, 12000); // 12 segundos máximo
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Se timeout foi atingido, redirecionar baseado no que temos
  if (forceRedirect) {
    console.log("🚨 [ROOT REDIRECT] Redirecionamento forçado por timeout");
    if (user && profile) {
      const roleName = getUserRoleName(profile);
      if (isAdmin || roleName === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      if (roleName === 'formacao') {
        return <Navigate to="/formacao" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  
  // Se ainda está carregando autenticação
  if (authLoading) {
    return <LoadingScreen message="Verificando sua sessão..." />;
  }
  
  // Se não há usuário, vai para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Se há usuário mas não há perfil, aguardar um pouco mais ou ir para login
  if (!profile) {
    return <Navigate to="/login" replace />;
  }
  
  // CORREÇÃO CRÍTICA: Verificar se é admin ANTES de verificar onboarding
  const roleName = getUserRoleName(profile);
  
  // Se é admin, ir direto para área administrativa (SEM verificar onboarding)
  if (isAdmin || roleName === 'admin') {
    console.log("🎯 [ROOT REDIRECT] Admin detectado - redirecionando para /admin");
    return <Navigate to="/admin" replace />;
  }
  
  // Se é formação, ir direto para área de formação
  if (roleName === 'formacao') {
    console.log("🎯 [ROOT REDIRECT] Formação detectado - redirecionando para /formacao");
    return <Navigate to="/formacao" replace />;
  }
  
  // APENAS para não-admins: verificar onboarding
  if (onboardingLoading) {
    return <LoadingScreen message="Verificando seu progresso..." />;
  }
  
  // Se precisa de onboarding (apenas para não-admins)
  if (onboardingRequired) {
    console.log("📝 [ROOT REDIRECT] Onboarding necessário - redirecionando para /onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Caso padrão: dashboard
  console.log("🏠 [ROOT REDIRECT] Redirecionando para dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
