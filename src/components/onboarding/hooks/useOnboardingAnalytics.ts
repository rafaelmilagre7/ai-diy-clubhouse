
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

interface AnalyticsEvent {
  event_type: string;
  user_id: string;
  event_data: any;
  created_at: string;
}

export const useOnboardingAnalytics = () => {
  const { log, logError } = useLogging();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const trackEvent = async (eventType: string, userId: string, eventData: any = {}) => {
    try {
      log('Rastreando evento de onboarding', { eventType, userId });

      // CORREÇÃO: Usar a tabela analytics que existe no schema
      const { error } = await supabase
        .from('analytics')
        .insert({
          event_type: eventType,
          user_id: userId,
          event_data: eventData
        });

      if (error) {
        logError('Erro ao rastrear evento', error);
        return false;
      }

      log('Evento rastreado com sucesso');
      return true;
    } catch (error: any) {
      logError('Erro inesperado ao rastrear evento', error);
      return false;
    }
  };

  const getAnalytics = async (userId?: string) => {
    try {
      setLoading(true);
      log('Buscando analytics de onboarding', { userId });

      let query = supabase
        .from('analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        logError('Erro ao buscar analytics', error);
        return [];
      }

      setEvents(data || []);
      return data || [];
    } catch (error: any) {
      logError('Erro inesperado ao buscar analytics', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    trackEvent,
    getAnalytics,
    events,
    loading
  };
};
