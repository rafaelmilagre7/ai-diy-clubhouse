import { useCallback } from 'react';
import { useLogging } from '@/hooks/useLogging';

interface FlowAnalyticsEvent {
  solution_id: string;
  flow_type?: string;
  step_id?: string;
  [key: string]: any;
}

export const useFlowAnalytics = () => {
  const { log } = useLogging();

  const trackFlowViewed = useCallback((data: FlowAnalyticsEvent) => {
    log('Analytics: flow_viewed', {
      event: 'flow_viewed',
      ...data,
      timestamp: new Date().toISOString()
    });
  }, [log]);

  const trackStepCompleted = useCallback((data: FlowAnalyticsEvent & { time_taken_days?: number }) => {
    log('Analytics: flow_step_completed', {
      event: 'flow_step_completed',
      ...data,
      timestamp: new Date().toISOString()
    });
  }, [log]);

  const trackFlowExported = useCallback((data: FlowAnalyticsEvent & { export_format: string }) => {
    log('Analytics: flow_exported', {
      event: 'flow_exported',
      ...data,
      timestamp: new Date().toISOString()
    });
  }, [log]);

  const trackNoteAdded = useCallback((data: FlowAnalyticsEvent & { note_length: number }) => {
    log('Analytics: flow_note_added', {
      event: 'flow_note_added',
      ...data,
      timestamp: new Date().toISOString()
    });
  }, [log]);

  const trackZoomChanged = useCallback((data: FlowAnalyticsEvent & { zoom_level: number }) => {
    log('Analytics: flow_zoom_changed', {
      event: 'flow_zoom_changed',
      ...data,
      timestamp: new Date().toISOString()
    });
  }, [log]);

  return {
    trackFlowViewed,
    trackStepCompleted,
    trackFlowExported,
    trackNoteAdded,
    trackZoomChanged
  };
};
