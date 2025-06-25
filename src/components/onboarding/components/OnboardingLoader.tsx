
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useOnboardingRequired } from '@/hooks/useOnboardingRequired';
import { useAdminPreview } from '@/hooks/useAdminPreview';
import LoadingScreen from '@/components/common/LoadingScreen';
import { getUserRoleName } from '@/lib/supabase/types';
import { AdminPreviewBanner } from './AdminPreviewBanner';

interface OnboardingLoaderProps {
  children: React.ReactNode;
}

export const OnboardingLoader = ({ children }: OnboardingLoaderProps) => {
  console.log('[OnboardingLoader] Renderizando');
  
  const { user, profile, isLoading: authLoading } = useSimpleAuth();
  const { isRequired, isLoading: onboardingLoading, hasCompleted } = useOnboardingRequired();
  const { isAdminPreviewMode, isValidAdminAccess } = useAdminPreview();

  const roleName = getUserRoleName(profile);
  const memberType = roleName === 'formacao' ? 'formacao' : 'club';

  console.log('[OnboardingLoader] Estado:', {
    authLoading,
    onboardingLoading,
    user: !!user,
    profile: !!profile,
    isRequired,
    hasCompleted,
    memberType,
    roleName,
    isAdminPreviewMode,
    profileOnboardingCompleted: profile?.onboarding_completed
  });

  // Mostrar loading enquanto carrega
  if (authLoading || onboardingLoading) {
    console.log('[OnboardingLoader] Carregando...');
    return <LoadingScreen message="Verificando seu progresso..." />;
  }

  // Se não está autenticado, redirecionar para login
  if (!user) {
    console.log('[OnboardingLoader] Redirecionando para login');
    return <Navigate to="/auth" replace />;
  }

  // MODO ADMIN PREVIEW: Permitir acesso mesmo se onboarding já foi concluído
  if (isAdminPreviewMode && isValidAdminAccess) {
    console.log('[OnboardingLoader] Modo admin preview ativo - permitindo acesso');
    return (
      <>
        <AdminPreviewBanner />
        <div style={{ paddingTop: '60px' }}>
          {children}
        </div>
      </>
    );
  }

  // CORREÇÃO CRÍTICA: Se onboarding foi concluído, redirecionar para dashboard apropriado
  if (hasCompleted && !isRequired) {
    console.log('[OnboardingLoader] Onboarding completo, redirecionando para dashboard');
    const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Se onboarding é necessário, renderizar wizard
  if (isRequired) {
    console.log('[OnboardingLoader] Renderizando wizard de onboarding');
    return <>{children}</>;
  }

  // Fallback - não deveria chegar aqui, mas por segurança
  console.log('[OnboardingLoader] Estado inesperado, redirecionando para dashboard');
  return <Navigate to="/dashboard" replace />;
};
