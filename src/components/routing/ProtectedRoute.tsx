
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";
import { logger } from '@/utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRole?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requiredRole
}: ProtectedRouteProps) => {
  const { user, profile, isAdmin, hasCompletedOnboarding, isLoading } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [redirectDelay, setRedirectDelay] = useState(false);
  
  // Timeout para carregamento de perfil (10 segundos)
  useEffect(() => {
    if (!user || profile || !isLoading) {
      return;
    }

    const timer = setTimeout(() => {
      if (!profile && user) {
        logger.warn('[PROTECTED] Timeout no carregamento do perfil', {
          userId: user.id,
          email: user.email,
          timeoutDuration: '10s'
        });
        setTimeoutReached(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [user, profile, isLoading]);

  // Log para debug
  useEffect(() => {
    logger.info('[PROTECTED] Estado da rota protegida', {
      path: location.pathname,
      hasUser: !!user,
      hasProfile: !!profile,
      isLoading,
      timeoutReached,
      requireAdmin,
      requiredRole
    });
  }, [user, profile, isLoading, timeoutReached, location.pathname, requireAdmin, requiredRole]);
  
  // 1. Loading state - aguardar autenticação e perfil
  if (isLoading && !timeoutReached) {
    return <LoadingScreen message="Verificando sua autenticação..." />;
  }

  // 2. Não autenticado - redirecionar para login
  if (!user) {
    logger.info('[PROTECTED] Usuário não autenticado, redirecionando para login', {
      from: location.pathname
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Timeout ou sem perfil - mostrar erro e redirecionar
  if (timeoutReached || (!profile && !isLoading)) {
    logger.error('[PROTECTED] Perfil não disponível após timeout', {
      userId: user.id,
      email: user.email,
      timeoutReached,
      hasProfile: !!profile
    });
    
    if (!redirectDelay) {
      toast.error("Erro na configuração da conta. Redirecionando...");
      setRedirectDelay(true);
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
    
    return <LoadingScreen message="Erro na configuração da conta..." />;
  }

  // 4. Verificação de onboarding - simplificada
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  
  if (!hasCompletedOnboarding && !isOnboardingRoute) {
    logger.info('[PROTECTED] Usuário precisa completar onboarding', {
      userId: user.id,
      currentPath: location.pathname
    });
    return <Navigate to="/onboarding" replace />;
  }

  // Evitar redirect loop do onboarding
  if (hasCompletedOnboarding && isOnboardingRoute) {
    logger.info('[PROTECTED] Usuário já completou onboarding, redirecionando', {
      userId: user.id,
      from: location.pathname
    });
    return <Navigate to="/dashboard" replace />;
  }
  
  // Verificar se requer admin e usuário não é admin
  if ((requiredRole === 'admin' || requireAdmin) && !isAdmin) {
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar role específico
  if (requiredRole && requiredRole !== 'admin') {
    const userRoleName = profile?.user_roles?.name || profile?.role_id;
    if (userRoleName !== requiredRole && !isAdmin) {
      toast.error("Você não tem permissão para acessar esta área");
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Usuário está autenticado, tem perfil válido e permissões necessárias
  return <>{children}</>;
};

export default ProtectedRoute;
