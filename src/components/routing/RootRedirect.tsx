
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState } from "react";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  
  // Timeout de segurança para evitar carregamento infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn("[RootRedirect] Timeout excedido, forçando redirecionamento");
      setTimeoutExceeded(true);
    }, 8000); // 8 segundos

    return () => clearTimeout(timeout);
  }, []);
  
  console.log('[RootRedirect] Estado atual:', {
    authLoading,
    onboardingLoading,
    user: !!user,
    profile: !!profile,
    profileRole: profile?.role,
    onboardingRequired,
    isAdmin,
    timeoutExceeded
  });
  
  // Se timeout excedido, redirecionar para fallback seguro
  if (timeoutExceeded) {
    console.log('[RootRedirect] Timeout - redirecionando para fallback');
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se ainda estiver carregando autenticação
  if (authLoading) {
    console.log('[RootRedirect] Carregando autenticação...');
    return <LoadingScreen message="Verificando sua sessão..." />;
  }
  
  // Se não há usuário, vai para login
  if (!user) {
    console.log('[RootRedirect] Sem usuário - redirecionando para login');
    return <Navigate to="/login" replace />;
  }
  
  // Se há usuário mas ainda está carregando o profile
  if (!profile && !timeoutExceeded) {
    console.log('[RootRedirect] Carregando profile...');
    return <LoadingScreen message="Carregando seu perfil..." />;
  }
  
  // Se ainda está carregando onboarding
  if (onboardingLoading) {
    console.log('[RootRedirect] Carregando status de onboarding...');
    return <LoadingScreen message="Verificando seu progresso..." />;
  }
  
  // Se precisa de onboarding
  if (onboardingRequired) {
    console.log('[RootRedirect] Onboarding necessário');
    return <Navigate to="/onboarding" replace />;
  }
  
  // Se é admin (verificar por múltiplas fontes)
  if (isAdmin || profile?.role === 'admin') {
    console.log('[RootRedirect] Usuário admin - redirecionando para admin');
    return <Navigate to="/admin" replace />;
  }
  
  // Se é formação
  if (profile?.role === 'formacao') {
    console.log('[RootRedirect] Usuário formação - redirecionando para formacao');
    return <Navigate to="/formacao" replace />;
  }
  
  // Caso padrão: dashboard
  console.log('[RootRedirect] Redirecionando para dashboard (padrão)');
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
