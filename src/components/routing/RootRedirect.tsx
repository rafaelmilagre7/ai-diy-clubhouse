
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
  
  // Timeout de segurança para evitar carregamento infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      logger.warn("RootRedirect timeout excedido", { 
        component: 'ROOT_REDIRECT',
        timeoutDuration: '8000ms'
      });
      setTimeoutExceeded(true);
    }, 8000);

    return () => clearTimeout(timeout);
  }, []);
  
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
  
  // Se timeout excedido, redirecionar para fallback seguro
  if (timeoutExceeded) {
    logger.info('RootRedirect timeout - redirecionando para fallback', {
      component: 'ROOT_REDIRECT'
    });
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se ainda estiver carregando autenticação
  if (authLoading) {
    return <LoadingScreen message="Verificando sua sessão..." />;
  }
  
  // Se não há usuário, vai para login
  if (!user) {
    logger.info('RootRedirect sem usuário - redirecionando para login', {
      component: 'ROOT_REDIRECT'
    });
    return <Navigate to="/login" replace />;
  }
  
  // Se há usuário mas ainda está carregando o profile
  if (!profile && !timeoutExceeded) {
    return <LoadingScreen message="Carregando seu perfil..." />;
  }
  
  // Se ainda está carregando onboarding
  if (onboardingLoading) {
    return <LoadingScreen message="Verificando seu progresso..." />;
  }
  
  // Se precisa de onboarding
  if (onboardingRequired) {
    logger.info('RootRedirect onboarding necessário', {
      component: 'ROOT_REDIRECT'
    });
    return <Navigate to="/onboarding" replace />;
  }
  
  // Se é admin (verificar por múltiplas fontes)
  if (isAdmin || profile?.role === 'admin') {
    logger.info('RootRedirect usuário admin - redirecionando', {
      component: 'ROOT_REDIRECT'
    });
    return <Navigate to="/admin" replace />;
  }
  
  // Se é formação
  if (profile?.role === 'formacao') {
    logger.info('RootRedirect usuário formação - redirecionando', {
      component: 'ROOT_REDIRECT'
    });
    return <Navigate to="/formacao" replace />;
  }
  
  // Caso padrão: dashboard
  logger.info('RootRedirect redirecionando para dashboard (padrão)', {
    component: 'ROOT_REDIRECT'
  });
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
