
import React, { useRef, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useOnboardingRequired } from '@/hooks/useOnboardingRequired';
import { useAdminPreview } from '@/hooks/useAdminPreview';
import { useOnboardingDiagnostics } from '@/hooks/useOnboardingDiagnostics';
import LoadingScreen from '@/components/common/LoadingScreen';
import { AdminPreviewBanner } from './AdminPreviewBanner';
import { logger } from '@/utils/logger';

interface OnboardingLoaderProps {
  children: React.ReactNode;
}

export const OnboardingLoader = ({ children }: OnboardingLoaderProps) => {
  const redirectCountRef = useRef(0);
  const lastRedirectRef = useRef<string | null>(null);
  
  const { user, profile, isLoading: authLoading, error: authError } = useSimpleAuth();
  const { isRequired, isLoading: onboardingLoading, hasCompleted } = useOnboardingRequired();
  const { isAdminPreviewMode, isValidAdminAccess } = useAdminPreview();
  
  // DIAGNÓSTICO CRÍTICO: Executar para usuários com problemas
  useOnboardingDiagnostics();

  // Dados estáveis memoizados para evitar re-renderizações
  const stableData = useMemo(() => {
    const roleName = profile?.user_roles?.name;
    const memberType = roleName === 'formacao' ? 'formacao' : 'club';
    
    return {
      roleName,
      memberType,
      hasUser: !!user,
      hasProfile: !!profile,
      userEmail: user?.email || 'unknown'
    };
  }, [user?.email, profile?.user_roles?.name]);

  // Proteção contra loops infinitos
  const shouldPreventRedirect = useMemo(() => {
    const now = Date.now();
    const timeSinceLastRedirect = lastRedirectRef.current ? now - parseInt(lastRedirectRef.current) : Infinity;
    
    // Prevenir redirecionamentos muito frequentes (menos de 1 segundo)
    if (timeSinceLastRedirect < 1000) {
      logger.warn('[ONBOARDING-LOADER] Redirecionamento muito frequente detectado - bloqueando');
      return true;
    }
    
    // Resetar contador se passou mais de 5 segundos
    if (timeSinceLastRedirect > 5000) {
      redirectCountRef.current = 0;
    }
    
    // Limitar máximo de 3 redirecionamentos por ciclo
    if (redirectCountRef.current >= 3) {
      logger.error('[ONBOARDING-LOADER] LOOP INFINITO DETECTADO - bloqueando redirecionamentos');
      return true;
    }
    
    return false;
  }, []);

  const totalLoading = authLoading || onboardingLoading;

  logger.info('[ONBOARDING-LOADER] Estado atual (PROTEÇÃO ANTI-LOOP):', {
    authLoading,
    onboardingLoading,
    hasUser: stableData.hasUser,
    hasProfile: stableData.hasProfile,
    isRequired,
    hasCompleted,
    memberType: stableData.memberType,
    isAdminPreviewMode,
    redirectCount: redirectCountRef.current,
    shouldPreventRedirect,
    profileOnboardingCompleted: profile?.onboarding_completed,
    userEmail: stableData.userEmail
  });

  // Erro de auth
  if (authError) {
    logger.error('[ONBOARDING-LOADER] Erro de auth:', authError);
    return <Navigate to="/auth" replace />;
  }

  // Loading normal
  if (totalLoading) {
    logger.info('[ONBOARDING-LOADER] Carregando...');
    return <LoadingScreen message="Verificando seu progresso..." />;
  }

  // Sem usuário = login
  if (!stableData.hasUser) {
    if (!shouldPreventRedirect) {
      redirectCountRef.current++;
      lastRedirectRef.current = Date.now().toString();
      logger.info('[ONBOARDING-LOADER] Redirecionando para login');
      return <Navigate to="/auth" replace />;
    }
    return <LoadingScreen message="Aguardando autenticação..." />;
  }

  // Aguardar perfil
  if (stableData.hasUser && !stableData.hasProfile) {
    logger.warn('[ONBOARDING-LOADER] Aguardando perfil do usuário');
    return <LoadingScreen message="Carregando seu perfil..." />;
  }

  // MODO ADMIN PREVIEW: Permitir acesso APENAS se já completou onboarding
  if (isAdminPreviewMode && isValidAdminAccess && hasCompleted) {
    logger.info('[ONBOARDING-LOADER] Modo admin preview ativo - onboarding completo');
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
    if (!shouldPreventRedirect) {
      redirectCountRef.current++;
      lastRedirectRef.current = Date.now().toString();
      logger.info('[ONBOARDING-LOADER] Onboarding completo, redirecionando para dashboard');
      const redirectPath = stableData.memberType === 'formacao' ? '/formacao' : '/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
    return <LoadingScreen message="Finalizando redirecionamento..." />;
  }

  // Se onboarding é necessário, renderizar wizard
  if (isRequired) {
    logger.info('[ONBOARDING-LOADER] Renderizando wizard de onboarding OBRIGATÓRIO (com proteção anti-loop)');
    return <>{children}</>;
  }

  // Fallback - com proteção
  if (!shouldPreventRedirect) {
    redirectCountRef.current++;
    lastRedirectRef.current = Date.now().toString();
    logger.info('[ONBOARDING-LOADER] Estado inesperado, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // Fallback final para evitar loop
  logger.error('[ONBOARDING-LOADER] FALLBACK FINAL - renderizando onboarding para evitar loop');
  return <>{children}</>;
};
