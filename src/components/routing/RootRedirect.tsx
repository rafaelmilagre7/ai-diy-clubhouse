
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
  const [fallbackUsed, setFallbackUsed] = useState(false);
  
  // Timeout reduzido para 5 segundos
  useEffect(() => {
    const timeout = setTimeout(() => {
      logger.warn("RootRedirect timeout excedido", { 
        component: 'ROOT_REDIRECT',
        timeoutDuration: '5000ms',
        hasUser: !!user,
        hasProfile: !!profile
      });
      setTimeoutExceeded(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [user, profile]);
  
  // Fallback adicional para casos extremos
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (!user && !profile && authLoading) {
        logger.warn("Fallback ativado - redirecionando para login");
        setFallbackUsed(true);
      }
    }, 3000);

    return () => clearTimeout(fallbackTimeout);
  }, [user, profile, authLoading]);
  
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
      fallbackUsed,
      component: 'ROOT_REDIRECT'
    });
  }
  
  // Fallback de emergência
  if (fallbackUsed) {
    return <Navigate to="/login" replace />;
  }
  
  // Se timeout excedido, usar fallback inteligente
  if (timeoutExceeded) {
    if (!user) {
      logger.warn("Timeout sem usuário, redirecionando para login");
      return <Navigate to="/login" replace />;
    }
    
    // Se há usuário mas não há perfil, ir para dashboard
    if (user && !profile) {
      logger.warn("Timeout com usuário mas sem perfil, usando fallback para dashboard");
      return <Navigate to="/dashboard" replace />;
    }
    
    // Se há perfil, usar lógica normal
    if (profile?.role === 'admin' || isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    if (profile?.role === 'formacao') {
      return <Navigate to="/formacao" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se ainda estiver carregando autenticação (mas não muito tempo)
  if (authLoading && !timeoutExceeded) {
    return <LoadingScreen message="Verificando sua sessão..." showProgress={true} />;
  }
  
  // Se não há usuário, vai para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Se há usuário mas não há perfil ainda (e não excedeu timeout)
  if (!profile && !timeoutExceeded) {
    return <LoadingScreen message="Carregando seu perfil..." showProgress={true} />;
  }
  
  // Se ainda está carregando onboarding
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
