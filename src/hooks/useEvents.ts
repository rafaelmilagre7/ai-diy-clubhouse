
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types/events';

interface UseEventsOptions {
  includeParentEvents?: boolean;
}

export const useEvents = (options: UseEventsOptions = {}) => {
  return useQuery({
    queryKey: ['events', options.includeParentEvents],
    queryFn: async (): Promise<Event[]> => {
      console.log('🔍 [EVENTS] Fetching events with options:', options);
      
      let query = supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      // Se não incluir eventos pai, filtrar apenas eventos não recorrentes ou filhos
      if (!options.includeParentEvents) {
        query = query.is('parent_event_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [EVENTS] Error fetching events:', error);
        throw error;
      }

      console.log('✅ [EVENTS] Events fetched successfully:', data?.length || 0);
      return (data as Event[]) || [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
