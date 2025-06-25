
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useOnboardingRequired } from '@/hooks/useOnboardingRequired';
import { useAdminPreview } from '@/hooks/useAdminPreview';
import { useOnboardingDiagnostics } from '@/hooks/useOnboardingDiagnostics';
import LoadingScreen from '@/components/common/LoadingScreen';
import { AdminPreviewBanner } from './AdminPreviewBanner';

interface OnboardingLoaderProps {
  children: React.ReactNode;
}

export const OnboardingLoader = ({ children }: OnboardingLoaderProps) => {
  console.log('[OnboardingLoader] Renderizando');
  
  const { user, profile, isLoading: authLoading } = useSimpleAuth();
  const { isRequired, isLoading: onboardingLoading, hasCompleted } = useOnboardingRequired();
  const { isAdminPreviewMode, isValidAdminAccess } = useAdminPreview();
  
  // DIAGNÓSTICO CRÍTICO: Executar para usuários com problemas
  useOnboardingDiagnostics();

  const roleName = profile?.user_roles?.name;
  const memberType = roleName === 'formacao' ? 'formacao' : 'club';

  console.log('[OnboardingLoader] Estado (ONBOARDING OBRIGATÓRIO + DIAGNÓSTICO):', {
    authLoading,
    onboardingLoading,
    user: !!user,
    profile: !!profile,
    isRequired,
    hasCompleted,
    memberType,
    roleName,
    isAdminPreviewMode,
    profileOnboardingCompleted: profile?.onboarding_completed,
    userEmail: user?.email
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

  // MODO ADMIN PREVIEW: Permitir acesso APENAS se já completou onboarding
  if (isAdminPreviewMode && isValidAdminAccess && hasCompleted) {
    console.log('[OnboardingLoader] Modo admin preview ativo - mas onboarding já completo');
    return (
      <>
        <AdminPreviewBanner />
        <div style={{ paddingTop: '60px' }}>
          {children}
        </div>
      </>
    );
  }

  // MUDANÇA CRÍTICA: Se onboarding foi concluído, redirecionar para dashboard
  if (hasCompleted && !isRequired) {
    console.log('[OnboardingLoader] Onboarding completo, redirecionando para dashboard');
    const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Se onboarding é necessário, renderizar wizard
  if (isRequired) {
    console.log('[OnboardingLoader] Renderizando wizard de onboarding OBRIGATÓRIO (com diagnóstico ativo)');
    return <>{children}</>;
  }

  // Fallback - não deveria chegar aqui, mas por segurança
  console.log('[OnboardingLoader] Estado inesperado, redirecionando para dashboard');
  return <Navigate to="/dashboard" replace />;
};
