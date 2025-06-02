
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
  const { isOnboardingComplete, isLoading: onboardingLoading, invalidateOnboardingCache } = useUnifiedOnboardingValidation();

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

  // Verificar se é admin (admins sempre têm acesso)
  const isAdmin = profile?.role === 'admin';

  // Invalidar cache quando o usuário navega entre páginas
  useEffect(() => {
    if (user?.id && !isPublicRoute) {
      invalidateOnboardingCache();
    }
  }, [location.pathname, user?.id, isPublicRoute, invalidateOnboardingCache]);

  // Log da navegação atual - apenas em desenvolvimento
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('SmartRedirectHandler', 'Navegação detectada', {
        pathname: location.pathname,
        isPublicRoute,
        isOnboardingRoute,
        isProfileRoute,
        requiresOnboarding,
        isProtectedRoute,
        isOnboardingComplete,
        isAdmin,
        userId: user?.id
      });
    }
  }, [location.pathname, isPublicRoute, isOnboardingRoute, isProfileRoute, requiresOnboarding, isProtectedRoute, isOnboardingComplete, isAdmin, user?.id]);

  // Redirecionar para onboarding apenas se a rota atual requer onboarding E não é uma rota protegida
  useEffect(() => {
    if (user && !isPublicRoute && !isOnboardingRoute && !authLoading && !onboardingLoading) {
      // NÃO redirecionar se for uma rota de perfil
      if (isProfileRoute) {
        return;
      }

      // Só redirecionar se a rota requer onboarding, onboarding não está completo, não é admin E não é uma rota protegida
      if (requiresOnboarding && !isOnboardingComplete && !isAdmin && !isProtectedRoute) {
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
    isAdmin,
    navigate,
    location.pathname
  ]);

  // Mostrar loading enquanto verifica dados
  if ((authLoading || onboardingLoading) && !isPublicRoute) {
    return <LoadingScreen message="Verificando configurações da conta..." />;
  }

  return <>{children}</>;
};
