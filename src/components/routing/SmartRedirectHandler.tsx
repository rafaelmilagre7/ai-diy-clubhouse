
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

  // Log da navegação atual
  useEffect(() => {
    logger.debug('SmartRedirectHandler', 'Navegação detectada', {
      pathname: location.pathname,
      isPublicRoute,
      isOnboardingRoute,
      requiresOnboarding,
      userId: user?.id
    });
  }, [location.pathname, isPublicRoute, isOnboardingRoute, requiresOnboarding, user?.id]);

  // Redirecionar para onboarding apenas se a rota atual requer onboarding
  useEffect(() => {
    if (user && !isPublicRoute && !isOnboardingRoute && !authLoading && !onboardingLoading) {
      if (requiresOnboarding && !isOnboardingComplete) {
        logger.info('SmartRedirectHandler', 'Redirecionando para onboarding - rota requer onboarding', {
          userId: user.id,
          currentPath: location.pathname,
          requiresOnboarding
        });
        navigate('/onboarding-new', { replace: true });
      }
    }
  }, [
    user, 
    isPublicRoute, 
    isOnboardingRoute, 
    requiresOnboarding,
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
