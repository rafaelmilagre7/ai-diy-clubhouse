
import React, { useRef, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useOnboardingRequired } from '@/hooks/useOnboardingRequired';
import { useAdminPreview } from '@/hooks/useAdminPreview';
import { useOnboardingDiagnostics } from '@/hooks/useOnboardingDiagnostics';
import { useLoadingTimeoutManager } from '@/hooks/useLoadingTimeoutManager';
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
  const { isInPossibleLoop } = useOnboardingDiagnostics();

  // CORREÇÃO CRÍTICA: Timeout manager com fallback agressivo
  const totalLoading = authLoading || onboardingLoading;
  const { shouldBeUnlocked, isForceUnlocked, forceUnlock } = useLoadingTimeoutManager({
    isLoading: totalLoading,
    context: 'OnboardingLoader',
    maxTimeoutMs: 2000, // 2 segundos máximo
    onForceUnlock: () => {
      logger.error('[ONBOARDING-LOADER] TIMEOUT FORÇADO - desbloqueando onboarding');
    }
  });

  // ADMIN BYPASS: Admin sempre desbloqueado imediatamente
  const isAdmin = profile?.user_roles?.name === 'admin';
  const shouldBypassLoading = isAdmin || isForceUnlocked || shouldBeUnlocked;

  // Dados estáveis memoizados para evitar re-renderizações
  const stableData = useMemo(() => {
    const roleName = profile?.user_roles?.name;
    const memberType = roleName === 'formacao' ? 'formacao' : 'club';
    
    return {
      roleName,
      memberType,
      hasUser: !!user,
      hasProfile: !!profile,
      userEmail: user?.email || 'unknown',
      isAdmin: roleName === 'admin'
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
    
    // Se está em loop possível, bloquear redirecionamentos
    if (isInPossibleLoop) {
      logger.error('[ONBOARDING-LOADER] Loop infinito detectado pelo diagnóstico - bloqueando redirecionamento');
      return true;
    }
    
    return false;
  }, [isInPossibleLoop]);

  // CORREÇÃO CRÍTICA: Loading nunca deve passar de 2 segundos
  const effectiveLoading = totalLoading && !shouldBypassLoading;

  logger.info('[ONBOARDING-LOADER] Estado atual (COM TIMEOUT AGRESSIVO):', {
    authLoading,
    onboardingLoading,
    totalLoading,
    shouldBypassLoading,
    effectiveLoading,
    hasUser: stableData.hasUser,
    hasProfile: stableData.hasProfile,
    isAdmin: stableData.isAdmin,
    isRequired,
    hasCompleted,
    memberType: stableData.memberType,
    isAdminPreviewMode,
    redirectCount: redirectCountRef.current,
    shouldPreventRedirect,
    isForceUnlocked,
    profileOnboardingCompleted: profile?.onboarding_completed,
    userEmail: stableData.userEmail
  });

  // Erro de auth
  if (authError) {
    logger.error('[ONBOARDING-LOADER] Erro de auth:', authError);
    return <Navigate to="/auth" replace />;
  }

  // CORREÇÃO: Loading com timeout forçado
  if (effectiveLoading) {
    logger.info('[ONBOARDING-LOADER] Carregando (com timeout ativo)...');
    return (
      <div>
        <LoadingScreen message="Verificando seu progresso..." />
        {/* Botão de emergência após 3 segundos */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={forceUnlock}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm opacity-50 hover:opacity-100"
          >
            Desbloquear (Emergência)
          </button>
        </div>
      </div>
    );
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

  // ADMIN BYPASS: Admin sempre vai direto para dashboard
  if (stableData.isAdmin && !isAdminPreviewMode) {
    logger.info('[ONBOARDING-LOADER] Admin detectado - bypass para dashboard');
    if (!shouldPreventRedirect) {
      redirectCountRef.current++;
      lastRedirectRef.current = Date.now().toString();
      return <Navigate to="/admin" replace />;
    }
    return <LoadingScreen message="Redirecionando admin..." />;
  }

  // Aguardar perfil (mas não por muito tempo)
  if (stableData.hasUser && !stableData.hasProfile && !shouldBypassLoading) {
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
  if (isRequired || shouldBypassLoading) {
    logger.info('[ONBOARDING-LOADER] Renderizando wizard de onboarding (COM TIMEOUT PROTECTION)');
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
