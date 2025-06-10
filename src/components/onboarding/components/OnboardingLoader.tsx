
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import LoadingScreen from '@/components/common/LoadingScreen';
import { getUserRoleName } from '@/lib/supabase/types';

interface OnboardingLoaderProps {
  children: React.ReactNode;
}

export const OnboardingLoader = ({ children }: OnboardingLoaderProps) => {
  console.log('[OnboardingLoader] Renderizando');
  
  const { user, profile, isLoading: authLoading, isAdmin } = useAuth();
  const { isRequired, isLoading: onboardingLoading } = useOnboardingStatus();

  // CORREÇÃO CRÍTICA: Usar getUserRoleName baseado em role_id
  const roleName = getUserRoleName(profile);
  const memberType = roleName === 'formacao' ? 'formacao' : 'club';

  console.log('[OnboardingLoader] Estado:', {
    authLoading,
    onboardingLoading,
    user: !!user,
    profile: !!profile,
    isRequired,
    memberType,
    isAdmin,
    roleName
  });

  // Mostrar loading enquanto carrega
  if (authLoading || onboardingLoading) {
    console.log('[OnboardingLoader] Carregando...');
    return <LoadingScreen message="Verificando seu progresso..." />;
  }

  // Se não está autenticado, redirecionar para login
  if (!user) {
    console.log('[OnboardingLoader] Redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // CORREÇÃO CRÍTICA: Se é admin, nunca mostrar onboarding
  if (isAdmin || roleName === 'admin') {
    console.log('[OnboardingLoader] Admin detectado - redirecionando para /admin');
    return <Navigate to="/admin" replace />;
  }

  // Se onboarding não é necessário, redirecionar para dashboard apropriado
  if (isRequired === false) {
    console.log('[OnboardingLoader] Onboarding completo, redirecionando para dashboard');
    const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Se onboarding é necessário (apenas para não-admins), renderizar wizard
  console.log('[OnboardingLoader] Renderizando wizard de onboarding');
  return <>{children}</>;
};
