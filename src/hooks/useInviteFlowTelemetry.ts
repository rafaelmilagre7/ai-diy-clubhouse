import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InviteFlowEvent {
  step: 'invite_opened' | 'validation_success' | 'validation_failed' | 'registration_started' | 'registration_completed' | 'profile_created' | 'onboarding_redirected' | 'flow_completed';
  inviteToken?: string;
  userId?: string;
  email?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export const useInviteFlowTelemetry = () => {
  const trackEvent = useCallback(async (event: InviteFlowEvent) => {
    try {
      const eventData = {
        event_type: 'invite_flow',
        event_data: {
          ...event,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href
        },
        user_id: event.userId || null,
        created_at: new Date().toISOString()
      };

      console.log(`📊 [TELEMETRY] Registrando evento: ${event.step}`, eventData);

      const { error } = await supabase
        .from('analytics')
        .insert([eventData]);

      if (error) {
        console.warn('⚠️ [TELEMETRY] Erro ao registrar evento:', error);
      }
    } catch (err) {
      console.warn('⚠️ [TELEMETRY] Falha na telemetria:', err);
    }
  }, []);

  const trackInviteOpened = useCallback((inviteToken: string) => {
    trackEvent({
      step: 'invite_opened',
      inviteToken,
      metadata: { from_url: document.referrer || 'direct' }
    });
  }, [trackEvent]);

  const trackValidationSuccess = useCallback((inviteToken: string, email: string) => {
    trackEvent({
      step: 'validation_success',
      inviteToken,
      email
    });
  }, [trackEvent]);

  const trackValidationFailed = useCallback((inviteToken: string, error: string) => {
    trackEvent({
      step: 'validation_failed',
      inviteToken,
      error
    });
  }, [trackEvent]);

  const trackRegistrationStarted = useCallback((inviteToken: string, email: string) => {
    trackEvent({
      step: 'registration_started',
      inviteToken,
      email
    });
  }, [trackEvent]);

  const trackRegistrationCompleted = useCallback((inviteToken: string, email: string, userId: string) => {
    trackEvent({
      step: 'registration_completed',
      inviteToken,
      email,
      userId
    });
  }, [trackEvent]);

  const trackProfileCreated = useCallback((userId: string, email: string, inviteToken?: string) => {
    trackEvent({
      step: 'profile_created',
      userId,
      email,
      inviteToken
    });
  }, [trackEvent]);

  const trackOnboardingRedirected = useCallback((userId: string, inviteToken?: string) => {
    trackEvent({
      step: 'onboarding_redirected',
      userId,
      inviteToken
    });
  }, [trackEvent]);

  const trackFlowCompleted = useCallback((userId: string, inviteToken?: string) => {
    trackEvent({
      step: 'flow_completed',
      userId,
      inviteToken,
      metadata: { conversion: true }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackInviteOpened,
    trackValidationSuccess,
    trackValidationFailed,
    trackRegistrationStarted,
    trackRegistrationCompleted,
    trackProfileCreated,
    trackOnboardingRedirected,
    trackFlowCompleted
  };
};