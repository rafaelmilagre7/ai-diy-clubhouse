
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface OnboardingEvent {
  event_type: 'step_start' | 'step_complete' | 'field_focus' | 'field_blur' | 'validation_error' | 'abandon' | 'complete';
  step_number?: number;
  field_name?: string;
  error_message?: string;
  metadata?: Record<string, any>;
}

export const useOnboardingAnalytics = () => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const trackEvent = useCallback(async (event: OnboardingEvent) => {
    if (!user?.id) return;

    try {
      const analyticsData = {
        user_id: user.id,
        event_type: event.event_type,
        step_number: event.step_number,
        field_name: event.field_name,
        error_message: event.error_message,
        metadata: event.metadata || {},
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('onboarding_analytics')
        .insert(analyticsData);

      if (error) throw error;

      console.log('[useOnboardingAnalytics] Evento registrado:', event.event_type);
    } catch (error) {
      console.error('[useOnboardingAnalytics] Erro ao registrar evento:', error);
      handleError(error, 'useOnboardingAnalytics.trackEvent', { showToast: false });
    }
  }, [user?.id, handleError]);

  const trackStepStart = useCallback((stepNumber: number) => {
    trackEvent({ event_type: 'step_start', step_number: stepNumber });
  }, [trackEvent]);

  const trackStepComplete = useCallback((stepNumber: number, timeSpent?: number) => {
    trackEvent({ 
      event_type: 'step_complete', 
      step_number: stepNumber,
      metadata: timeSpent ? { time_spent_seconds: timeSpent } : undefined
    });
  }, [trackEvent]);

  const trackFieldFocus = useCallback((fieldName: string, stepNumber: number) => {
    trackEvent({ 
      event_type: 'field_focus', 
      field_name: fieldName, 
      step_number: stepNumber 
    });
  }, [trackEvent]);

  const trackValidationError = useCallback((fieldName: string, errorMessage: string, stepNumber: number) => {
    trackEvent({ 
      event_type: 'validation_error', 
      field_name: fieldName, 
      error_message: errorMessage,
      step_number: stepNumber 
    });
  }, [trackEvent]);

  const trackAbandon = useCallback((stepNumber: number, timeSpent?: number) => {
    trackEvent({ 
      event_type: 'abandon', 
      step_number: stepNumber,
      metadata: timeSpent ? { time_spent_seconds: timeSpent } : undefined
    });
  }, [trackEvent]);

  const trackComplete = useCallback((totalTimeSpent?: number) => {
    trackEvent({ 
      event_type: 'complete',
      metadata: totalTimeSpent ? { total_time_spent_seconds: totalTimeSpent } : undefined
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackStepStart,
    trackStepComplete,
    trackFieldFocus,
    trackValidationError,
    trackAbandon,
    trackComplete
  };
};
