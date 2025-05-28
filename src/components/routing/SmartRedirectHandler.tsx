
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useOnboardingFlow } from '@/hooks/auth/useOnboardingFlow';
import { useAuthDataIntegrity } from '@/hooks/auth/useAuthDataIntegrity';
import { useLocation } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';

interface SmartRedirectHandlerProps {
  children: React.ReactNode;
}

export const SmartRedirectHandler: React.FC<SmartRedirectHandlerProps> = ({ children }) => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const { status: onboardingStatus, isLoading: onboardingLoading, redirectToOnboarding } = useOnboardingFlow();
  const { checkAndFixData, isChecking } = useAuthDataIntegrity();

  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  const isLoginRoute = location.pathname === '/login';
  const isPublicRoute = isLoginRoute || location.pathname === '/';

  useEffect(() => {
    // Se usuário autenticado não está em rota pública e onboarding não está completo
    if (user && !isPublicRoute && !isOnboardingRoute && !authLoading && !onboardingLoading) {
      if (!onboardingStatus.isCompleted && onboardingStatus.needsRedirect) {
        console.log('🔄 Usuário precisa completar onboarding, redirecionando...');
        redirectToOnboarding();
      }
    }
  }, [
    user, 
    isPublicRoute, 
    isOnboardingRoute, 
    authLoading, 
    onboardingLoading,
    onboardingStatus.isCompleted,
    onboardingStatus.needsRedirect,
    redirectToOnboarding
  ]);

  // Verificar integridade dos dados apenas uma vez após login
  useEffect(() => {
    if (user && profile && !isChecking) {
      checkAndFixData();
    }
  }, [user?.id, profile?.id]); // Só executar quando IDs mudarem

  // Mostrar loading enquanto verifica dados
  if ((authLoading || onboardingLoading || isChecking) && !isPublicRoute) {
    return <LoadingScreen message="Verificando configurações da conta..." />;
  }

  return <>{children}</>;
};
