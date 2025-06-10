
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
  
  // Se ainda está carregando onboarding (mas não por muito tempo)
  if (onboardingLoading) {
    return <LoadingScreen message="Verificando seu progresso..." />;
  }
  
  // Se precisa de onboarding
  if (onboardingRequired) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Usar getUserRoleName para determinar redirecionamento
  const roleName = getUserRoleName(profile);
  
  // Se é admin
  if (isAdmin || roleName === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  // Se é formação
  if (roleName === 'formacao') {
    return <Navigate to="/formacao" replace />;
  }
  
  // Caso padrão: dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
