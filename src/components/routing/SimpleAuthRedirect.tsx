
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useSimpleOnboarding } from '@/hooks/useSimpleOnboarding';
import LoadingScreen from '@/components/common/LoadingScreen';
import { getUserRoleName } from '@/lib/supabase/types';
import { logger } from '@/utils/logger';

export const SimpleAuthRedirect = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useSimpleOnboarding();

  logger.info('SimpleAuthRedirect:', {
    authLoading,
    onboardingLoading,
    hasUser: !!user,
    hasProfile: !!profile,
    onboardingRequired
  });

  // Mostrar loading apenas por alguns segundos
  if (authLoading || onboardingLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  // Sem usuário = ir para auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Onboarding obrigatório
  if (onboardingRequired) {
    return <Navigate to="/onboarding" replace />;
  }

  // Usuário autenticado - redirecionar baseado no role
  const userRole = getUserRoleName(profile);
  
  if (userRole === 'formacao') {
    return <Navigate to="/formacao" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};
