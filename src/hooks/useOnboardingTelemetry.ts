import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingTelemetry = () => {
  const { user } = useAuth();

  const logOnboardingEvent = useCallback(async (
    eventType: 'step_started' | 'step_completed' | 'step_abandoned' | 'validation_failed' | 'onboarding_completed',
    step: number,
    eventData: Record<string, any> = {}
  ) => {
    if (!user?.id) return;

    try {
      await supabase.rpc('log_onboarding_event', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_step: step,
        p_event_data: {
          ...eventData,
          user_agent: navigator.userAgent,
          timestamp: Date.now(),
          page_url: window.location.href
        }
      });
      
      console.log(`📊 [TELEMETRY] ${eventType} - Step ${step}`, eventData);
    } catch (error) {
      console.error('❌ [TELEMETRY] Erro ao registrar evento:', error);
    }
  }, [user?.id]);

  const logStepStarted = useCallback((step: number) => {
    logOnboardingEvent('step_started', step, { 
      started_at: Date.now(),
      previous_step: step - 1
    });
  }, [logOnboardingEvent]);

  const logStepCompleted = useCallback((step: number, formData: any = {}) => {
    logOnboardingEvent('step_completed', step, { 
      completed_at: Date.now(),
      form_data_length: JSON.stringify(formData).length,
      fields_filled: Object.keys(formData).filter(key => formData[key]).length
    });
  }, [logOnboardingEvent]);

  const logValidationFailed = useCallback((step: number, errors: Record<string, string>) => {
    logOnboardingEvent('validation_failed', step, { 
      error_fields: Object.keys(errors),
      error_count: Object.keys(errors).length,
      errors: errors
    });
  }, [logOnboardingEvent]);

  const logStepAbandoned = useCallback((step: number, timeSpent: number) => {
    logOnboardingEvent('step_abandoned', step, { 
      time_spent_seconds: Math.round(timeSpent / 1000),
      abandoned_at: Date.now()
    });
  }, [logOnboardingEvent]);

  const logOnboardingCompleted = useCallback((totalSteps: number, totalTime: number) => {
    logOnboardingEvent('onboarding_completed', totalSteps, { 
      total_time_minutes: Math.round(totalTime / 60000),
      completion_rate: 1.0,
      completed_at: Date.now()
    });
  }, [logOnboardingEvent]);

  return {
    logStepStarted,
    logStepCompleted,
    logValidationFailed,
    logStepAbandoned,
    logOnboardingCompleted
  };
};