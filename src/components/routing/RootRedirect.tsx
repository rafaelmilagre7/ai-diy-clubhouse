
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState } from "react";
import { logger } from "@/utils/logger";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  
  // Timeout de segurança reduzido para 3 segundos
  useEffect(() => {
    const timeout = setTimeout(() => {
      logger.warn("RootRedirect timeout excedido", { 
        component: 'ROOT_REDIRECT',
        timeoutDuration: '3000ms'
      });
      setTimeoutExceeded(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);
  
  if (process.env.NODE_ENV === 'development') {
    logger.debug('RootRedirect estado atual', {
      authLoading,
      onboardingLoading,
      hasUser: !!user,
      hasProfile: !!profile,
      profileRole: profile?.role,
      onboardingRequired,
      isAdmin,
      timeoutExceeded,
      component: 'ROOT_REDIRECT'
    });
  }
  
  // Se timeout excedido, redirecionar para fallback seguro
  if (timeoutExceeded) {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se ainda estiver carregando autenticação
  if (authLoading) {
    return <LoadingScreen message="Verificando sua sessão..." showProgress={true} />;
  }
  
  // Se não há usuário, vai para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Se há usuário mas ainda está carregando o profile (com timeout reduzido)
  if (!profile && !timeoutExceeded) {
    return <LoadingScreen message="Carregando seu perfil..." showProgress={true} />;
  }
  
  // Se ainda está carregando onboarding
  if (onboardingLoading) {
    return <LoadingScreen message="Verificando seu progresso..." />;
  }
  
  // Se precisa de onboarding
  if (onboardingRequired) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Se é admin (verificar por múltiplas fontes)
  if (isAdmin || profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  // Se é formação
  if (profile?.role === 'formacao') {
    return <Navigate to="/formacao" replace />;
  }
  
  // Caso padrão: dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
