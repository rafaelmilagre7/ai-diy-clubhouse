
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useOnboardingFlow } from '@/hooks/auth/useOnboardingFlow';
import { useAuthDataIntegrity } from '@/hooks/auth/useAuthDataIntegrity';
import { useLocation } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { AuthErrorFallback } from '@/components/auth/AuthErrorFallback';
import { logger } from '@/utils/logger';

interface SmartRedirectHandlerProps {
  children: React.ReactNode;
}

export const SmartRedirectHandler: React.FC<SmartRedirectHandlerProps> = ({ children }) => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const { status: onboardingStatus, isLoading: onboardingLoading, redirectToOnboarding } = useOnboardingFlow();
  const { checkAndFixData, isChecking, hasIntegrityIssues } = useAuthDataIntegrity();

  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  const isLoginRoute = location.pathname === '/login';
  const isPublicRoute = isLoginRoute || location.pathname === '/';

  // Log da navegação atual
  useEffect(() => {
    logger.debug('SmartRedirectHandler', 'Navegação detectada', {
      pathname: location.pathname,
      isPublicRoute,
      isOnboardingRoute,
      userId: user?.id
    });
  }, [location.pathname, isPublicRoute, isOnboardingRoute, user?.id]);

  // Verificar integridade dos dados apenas uma vez após login
  useEffect(() => {
    if (user && profile && !isChecking && !hasIntegrityIssues) {
      logger.info('SmartRedirectHandler', 'Iniciando verificação de integridade dos dados');
      checkAndFixData();
    }
  }, [user?.id, profile?.id, isChecking, hasIntegrityIssues, checkAndFixData]);

  // Redirecionar para onboarding se necessário
  useEffect(() => {
    if (user && !isPublicRoute && !isOnboardingRoute && !authLoading && !onboardingLoading) {
      if (!onboardingStatus.isCompleted && onboardingStatus.needsRedirect) {
        logger.info('SmartRedirectHandler', 'Redirecionando para onboarding', {
          userId: user.id,
          currentPath: location.pathname
        });
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
    redirectToOnboarding,
    location.pathname
  ]);

  // Mostrar loading enquanto verifica dados
  if ((authLoading || onboardingLoading || isChecking) && !isPublicRoute) {
    return <LoadingScreen message="Verificando configurações da conta..." />;
  }

  // Mostrar erro se houver problemas de integridade não resolvidos
  if (hasIntegrityIssues && !isPublicRoute) {
    return (
      <AuthErrorFallback
        error="Problemas detectados na configuração da conta"
        onRetry={checkAndFixData}
        isRetrying={isChecking}
      />
    );
  }

  return <>{children}</>;
};
