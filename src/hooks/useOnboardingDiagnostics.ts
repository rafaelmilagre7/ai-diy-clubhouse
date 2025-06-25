
import { useEffect, useRef } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useOnboardingRequired } from '@/hooks/useOnboardingRequired';
import { logger } from '@/utils/logger';

export const useOnboardingDiagnostics = () => {
  const diagnosticCountRef = useRef(0);
  const lastStateRef = useRef<string>('');
  
  const { user, profile, isLoading: authLoading } = useSimpleAuth();
  const { isRequired, isLoading: onboardingLoading, hasCompleted } = useOnboardingRequired();

  useEffect(() => {
    const currentState = JSON.stringify({
      authLoading,
      onboardingLoading,
      hasUser: !!user,
      hasProfile: !!profile,
      isRequired,
      hasCompleted,
      userEmail: user?.email?.substring(0, 10) + '***'
    });

    // Só fazer log se o estado mudou
    if (currentState !== lastStateRef.current) {
      diagnosticCountRef.current++;
      lastStateRef.current = currentState;

      logger.info(`[ONBOARDING-DIAGNOSTICS #${diagnosticCountRef.current}] Estado:`, {
        authLoading,
        onboardingLoading,
        totalLoading: authLoading || onboardingLoading,
        hasUser: !!user,
        hasProfile: !!profile,
        profileData: profile ? {
          id: profile.id,
          onboardingCompleted: profile.onboarding_completed,
          userRole: profile.user_roles?.name
        } : null,
        isRequired,
        hasCompleted,
        userEmail: user?.email?.substring(0, 10) + '***',
        timestamp: new Date().toISOString()
      });

      // ALERTA CRÍTICO: Loading há mais de 5 segundos
      if (diagnosticCountRef.current > 20) {
        logger.error('[ONBOARDING-DIAGNOSTICS] POSSÍVEL LOOP INFINITO DETECTADO - mais de 20 mudanças de estado');
      }

      // ALERTA: Estados inconsistentes
      if (user && !profile && !authLoading) {
        logger.error('[ONBOARDING-DIAGNOSTICS] ESTADO INCONSISTENTE: usuário sem perfil e não carregando');
      }

      if (profile && profile.onboarding_completed && isRequired) {
        logger.error('[ONBOARDING-DIAGNOSTICS] ESTADO INCONSISTENTE: perfil completo mas onboarding requerido');
      }
    }
  }, [authLoading, onboardingLoading, user, profile, isRequired, hasCompleted]);

  // Diagnóstico de performance - executar a cada 3 segundos se ainda carregando
  useEffect(() => {
    if (authLoading || onboardingLoading) {
      const interval = setInterval(() => {
        logger.warn('[ONBOARDING-DIAGNOSTICS] AINDA CARREGANDO após 3s - estado atual:', {
          authLoading,
          onboardingLoading,
          diagnosticCount: diagnosticCountRef.current,
          hasUser: !!user,
          hasProfile: !!profile
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [authLoading, onboardingLoading, user, profile]);

  return {
    diagnosticCount: diagnosticCountRef.current,
    isInPossibleLoop: diagnosticCountRef.current > 20
  };
};
