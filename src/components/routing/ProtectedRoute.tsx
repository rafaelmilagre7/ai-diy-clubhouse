
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";
import { logger } from '@/utils/logger';
import { supabase } from '@/lib/supabase';

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
  const [loadingProgressTimeout, setLoadingProgressTimeout] = useState(false);
  const [navLoopDetected, setNavLoopDetected] = useState(false);
  const isMounted = useRef(true);
  
  // Detectar loops de navegação usando o banco
  useEffect(() => {
    if (!user?.id) return;
    
    const detectLoop = async () => {
      try {
        const { data: loopData } = await supabase.rpc('detect_navigation_loop', {
          p_user_id: user.id,
          p_path: location.pathname,
          p_session_id: user.id
        });
        
        if (loopData?.is_loop && isMounted.current) {
          logger.error('[PROTECTED] Loop de navegação detectado', {
            userId: user.id,
            path: location.pathname,
            recentCount: loopData.recent_count
          });
          setNavLoopDetected(true);
          toast.error("Loop de navegação detectado. Redirecionando para área segura...");
        }
      } catch (error) {
        logger.error('[PROTECTED] Erro ao detectar loop:', error);
      }
    };
    
    detectLoop();
  }, [user?.id, location.pathname]);
  
  // Timeout progressivo para loading (só após 8 segundos)
  useEffect(() => {
    if (!user || profile || !isLoading) {
      return;
    }

    const timer = setTimeout(() => {
      if (!profile && user && isMounted.current) {
        logger.warn('[PROTECTED] Loading prolongado detectado', {
          userId: user.id,
          email: user.email,
          timeoutDuration: '8s'
        });
        setLoadingProgressTimeout(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [user, profile, isLoading]);

  // Lifecycle management
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Log para debug
  useEffect(() => {
    logger.info('[PROTECTED] Estado da rota protegida', {
      path: location.pathname,
      hasUser: !!user,
      hasProfile: !!profile,
      isLoading,
      loadingProgressTimeout,
      navLoopDetected,
      requireAdmin,
      requiredRole
    });
  }, [user, profile, isLoading, loadingProgressTimeout, navLoopDetected, location.pathname, requireAdmin, requiredRole]);
  
  // 1. Loop de navegação detectado - redirecionar para área segura
  if (navLoopDetected) {
    logger.error('[PROTECTED] Redirecionando devido a loop de navegação');
    return <Navigate to="/dashboard" replace />;
  }
  
  // 2. Loading state - aguardar autenticação e perfil com timeout progressivo
  if (isLoading && !loadingProgressTimeout) {
    return <LoadingScreen message="Verificando sua autenticação..." />;
  }

  // 3. Não autenticado - redirecionar para login
  if (!user) {
    logger.info('[PROTECTED] Usuário não autenticado, redirecionando para login', {
      from: location.pathname
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Loading prolongado mas ainda válido - mostrar mensagem diferente
  if (isLoading && loadingProgressTimeout && user) {
    return <LoadingScreen message="Carregando configurações da conta..." />;
  }

  // 5. Sem perfil após loading completo - criar perfil ou mostrar erro
  if (!profile && !isLoading) {
    logger.warn('[PROTECTED] Perfil não encontrado após loading completo', {
      userId: user.id,
      email: user.email
    });
    
    // Tentar recarregar página uma vez se ainda não foi tentado
    if (!loadingProgressTimeout) {
      setLoadingProgressTimeout(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return <LoadingScreen message="Recarregando configurações..." />;
    }
    
    return <LoadingScreen message="Configurando sua conta..." />;
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
