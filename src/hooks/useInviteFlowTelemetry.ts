import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para telemetria específica do fluxo de convite→onboarding
 * Rastreia cada etapa do processo para diagnóstico e otimização
 */
export const useInviteFlowTelemetry = () => {
  
  const trackEvent = useCallback(async (eventType: string, data: any) => {
    try {
      const { error } = await supabase
        .from('analytics')
        .insert({
          user_id: data.user_id || 'anonymous',
          event_type: `invite_flow_${eventType}`,
          event_data: {
            ...data,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            user_agent: navigator.userAgent.substring(0, 200)
          }
        });
      
      if (error) {
        console.warn('⚠️ [INVITE-TELEMETRY] Erro ao registrar evento:', error);
      } else {
        console.log(`📊 [INVITE-TELEMETRY] Evento registrado: ${eventType}`);
      }
    } catch (err) {
      console.warn('⚠️ [INVITE-TELEMETRY] Falha na telemetria:', err);
    }
  }, []);

  const trackInviteValidation = useCallback(async (token: string, isValid: boolean, errorReason?: string) => {
    await trackEvent('invite_validation', {
      token_preview: token.substring(0, 6) + '***',
      is_valid: isValid,
      error_reason: errorReason,
      step: 'validation'
    });
  }, [trackEvent]);

  const trackRegistrationStarted = useCallback(async (token?: string, email?: string) => {
    await trackEvent('registration_started', {
      has_invite_token: !!token,
      token_preview: token ? token.substring(0, 6) + '***' : null,
      email_domain: email ? email.split('@')[1] : null,
      step: 'registration_form'
    });
  }, [trackEvent]);

  const trackRegistrationCompleted = useCallback(async (userId: string, token?: string) => {
    await trackEvent('registration_completed', {
      user_id: userId,
      has_invite_token: !!token,
      token_preview: token ? token.substring(0, 6) + '***' : null,
      step: 'user_created'
    });
  }, [trackEvent]);

  const trackProfileCreated = useCallback(async (userId: string, roleId?: string, inviteApplied?: boolean) => {
    await trackEvent('profile_created', {
      user_id: userId,
      role_id: roleId,
      invite_applied: inviteApplied,
      step: 'profile_setup'
    });
  }, [trackEvent]);

  const trackOnboardingStarted = useCallback(async (userId: string, prefilledData?: any) => {
    await trackEvent('onboarding_started', {
      user_id: userId,
      has_prefilled_data: !!prefilledData && Object.keys(prefilledData).length > 0,
      prefilled_fields: prefilledData ? Object.keys(prefilledData) : [],
      step: 'onboarding_init'
    });
  }, [trackEvent]);

  const trackOnboardingRedirected = useCallback(async (userId: string, targetStep: number) => {
    await trackEvent('onboarding_redirected', {
      user_id: userId,
      target_step: targetStep,
      step: 'onboarding_redirect'
    });
  }, [trackEvent]);

  const trackStepCompleted = useCallback(async (userId: string, step: number, stepData: any) => {
    await trackEvent('step_completed', {
      user_id: userId,
      step_number: step,
      fields_filled: stepData ? Object.keys(stepData).length : 0,
      step: `onboarding_step_${step}`
    });
  }, [trackEvent]);

  const trackOnboardingCompleted = useCallback(async (userId: string, roleId?: string) => {
    await trackEvent('onboarding_completed', {
      user_id: userId,
      role_id: roleId,
      step: 'onboarding_finished'
    });
  }, [trackEvent]);

  const trackFlowAbandoned = useCallback(async (userId: string, lastStep: string, reason?: string) => {
    await trackEvent('flow_abandoned', {
      user_id: userId,
      last_step: lastStep,
      abandonment_reason: reason,
      step: 'abandonment'
    });
  }, [trackEvent]);

  return {
    trackInviteValidation,
    trackRegistrationStarted,
    trackRegistrationCompleted,
    trackProfileCreated,
    trackOnboardingStarted,
    trackOnboardingRedirected,
    trackStepCompleted,
    trackOnboardingCompleted,
    trackFlowAbandoned
  };
};