
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useSimpleOnboardingValidation } from '@/hooks/onboarding/useSimpleOnboardingValidation';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { AuthErrorFallback } from '@/components/auth/AuthErrorFallback';
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
  const { isOnboardingComplete, isLoading: onboardingLoading } = useSimpleOnboardingValidation();

  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  const isLoginRoute = location.pathname === '/login';
  const isPublicRoute = isLoginRoute || location.pathname === '/';
  
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
      requiresOnboarding,
      isProtectedRoute,
      userId: user?.id
    });
  }, [location.pathname, isPublicRoute, isOnboardingRoute, requiresOnboarding, isProtectedRoute, user?.id]);

  // Redirecionar para onboarding apenas se a rota atual requer onboarding E não é uma rota protegida
  useEffect(() => {
    if (user && !isPublicRoute && !isOnboardingRoute && !authLoading && !onboardingLoading) {
      // Só redirecionar se a rota requer onboarding E não é uma rota protegida
      if (requiresOnboarding && !isOnboardingComplete && !isProtectedRoute) {
        console.log('🔄 SmartRedirectHandler: Redirecionando para onboarding - rota requer onboarding', {
          userId: user.id,
          currentPath: location.pathname,
          requiresOnboarding,
          isProtectedRoute
        });
        navigate('/onboarding-new', { replace: true });
      }
    }
  }, [
    user, 
    isPublicRoute, 
    isOnboardingRoute, 
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
