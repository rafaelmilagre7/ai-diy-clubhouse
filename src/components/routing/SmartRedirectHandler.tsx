
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';

interface SmartRedirectHandlerProps {
  children: React.ReactNode;
}

// Rotas que requerem onboarding completo
const ONBOARDING_REQUIRED_ROUTES = [
  '/networking',
  '/implementation-trail'
];

// Rotas que NUNCA devem ser redirecionadas
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
  const isPublicRoute = location.pathname === '/login' || location.pathname === '/';
  const isProfileRoute = location.pathname.startsWith('/profile');
  
  const requiresOnboarding = ONBOARDING_REQUIRED_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );

  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );

  const isAdmin = profile?.role === 'admin';

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
