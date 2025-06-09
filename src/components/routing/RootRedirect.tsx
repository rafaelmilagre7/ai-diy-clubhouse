
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
  
  // Timeout reduzido para 3 segundos
  useEffect(() => {
    const timeout = setTimeout(() => {
      logger.warn("RootRedirect timeout excedido", { 
        component: 'ROOT_REDIRECT',
        timeoutDuration: '3000ms',
        hasUser: !!user,
        hasProfile: !!profile
      });
      setTimeoutExceeded(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [user, profile]);
  
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
  
  // Se timeout excedido, usar fallback inteligente
  if (timeoutExceeded) {
    if (!user) {
      logger.warn("Timeout sem usuário, redirecionando para login");
      return <Navigate to="/login" replace />;
    }
    
    // Se há usuário, redirecionar baseado no que temos
    if (profile?.role === 'admin' || isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    if (profile?.role === 'formacao') {
      return <Navigate to="/formacao" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se ainda estiver carregando (mas não muito tempo)
  if (authLoading && !timeoutExceeded) {
    return <LoadingScreen message="Verificando sua sessão..." showProgress={true} />;
  }
  
  // Se não há usuário, vai para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Se há usuário mas ainda está carregando onboarding
  if (onboardingLoading && !timeoutExceeded) {
    return <LoadingScreen message="Verificando seu progresso..." />;
  }
  
  // Se precisa de onboarding
  if (onboardingRequired && !timeoutExceeded) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Se é admin
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
