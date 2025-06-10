
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { useAdminPreview } from '@/hooks/useAdminPreview';
import LoadingScreen from '@/components/common/LoadingScreen';
import { getUserRoleName } from '@/lib/supabase/types';
import { AdminPreviewBanner } from './AdminPreviewBanner';

interface OnboardingLoaderProps {
  children: React.ReactNode;
}

export const OnboardingLoader = ({ children }: OnboardingLoaderProps) => {
  console.log('[OnboardingLoader] Renderizando');
  
  const { user, profile, isLoading: authLoading, isAdmin } = useAuth();
  const { isRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  const { isAdminPreviewMode, isValidAdminAccess } = useAdminPreview();

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
    roleName,
    isAdminPreviewMode
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

  // CORREÇÃO CRÍTICA: Se é admin, nunca mostrar onboarding (apenas fora do modo preview)
  if (isAdmin || roleName === 'admin') {
    console.log('[OnboardingLoader] Admin detectado - redirecionando para /dashboard');
    return <Navigate to="/dashboard" replace />;
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
