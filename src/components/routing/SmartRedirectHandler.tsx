
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { logger } from '@/utils/logger';

interface SmartRedirectHandlerProps {
  children: React.ReactNode;
}

// Rotas que requerem onboarding completo
const ONBOARDING_REQUIRED_ROUTES = [
  '/networking',
  '/implementation-trail'
];

// Rotas que NUNCA devem ser redirecionadas (mesmo se onboarding incompleto)
const PROTECTED_ROUTES = [
  '/profile',
  '/comunidade',
  '/learning',
  '/dashboard',
  '/solutions',
  '/tools'
];

export const SmartRedirectHandler: React.FC<SmartRedirectHandlerProps> = ({ children }) => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useUnifiedOnboardingValidation();

  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  const isLoginRoute = location.pathname === '/login';
  const isPublicRoute = isLoginRoute || location.pathname === '/';
  const isProfileRoute = location.pathname.startsWith('/profile');
  
  // Verificar se a rota atual requer onboarding completo
  const requiresOnboarding = ONBOARDING_REQUIRED_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );

  // Verificar se é uma rota protegida que NUNCA deve ser redirecionada
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );

  console.log('🔍 SmartRedirectHandler: Analisando navegação', {
    pathname: location.pathname,
    isPublicRoute,
    isOnboardingRoute,
    isProfileRoute,
    requiresOnboarding,
    isProtectedRoute,
    isOnboardingComplete,
    userId: user?.id
  });

  // Log da navegação atual
  useEffect(() => {
    logger.debug('SmartRedirectHandler', 'Navegação detectada', {
      pathname: location.pathname,
      isPublicRoute,
      isOnboardingRoute,
      isProfileRoute,
      requiresOnboarding,
      isProtectedRoute,
      userId: user?.id
    });
  }, [location.pathname, isPublicRoute, isOnboardingRoute, isProfileRoute, requiresOnboarding, isProtectedRoute, user?.id]);

  // Redirecionar para onboarding apenas se a rota atual requer onboarding E não é uma rota protegida
  useEffect(() => {
    if (user && !isPublicRoute && !isOnboardingRoute && !authLoading && !onboardingLoading) {
      // NÃO redirecionar se for uma rota de perfil
      if (isProfileRoute) {
        console.log('🔍 SmartRedirectHandler: Rota de perfil detectada - não redirecionando', {
          pathname: location.pathname
        });
        return;
      }

      // Só redirecionar se a rota requer onboarding, onboarding não está completo E não é uma rota protegida
      if (requiresOnboarding && !isOnboardingComplete && !isProtectedRoute) {
        console.log('🔄 SmartRedirectHandler: Redirecionando para onboarding - rota requer onboarding', {
          userId: user.id,
          currentPath: location.pathname,
          requiresOnboarding,
          isProtectedRoute,
          isOnboardingComplete
        });
        navigate('/onboarding-new', { replace: true });
      }
    }
  }, [
    user, 
    isPublicRoute, 
    isOnboardingRoute,
    isProfileRoute,
    requiresOnboarding,
    isProtectedRoute,
    authLoading, 
    onboardingLoading,
    isOnboardingComplete,
    navigate,
    location.pathname
  ]);

  // Mostrar loading enquanto verifica dados
  if ((authLoading || onboardingLoading) && !isPublicRoute) {
    return <LoadingScreen message="Verificando configurações da conta..." />;
  }

  return <>{children}</>;
};
