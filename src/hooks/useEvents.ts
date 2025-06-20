
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import type { Event } from '@/types/events';

interface UseEventsOptions {
  includeParentEvents?: boolean;
}

export const useEvents = (options: UseEventsOptions = {}) => {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const {
    data: events = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['events', options.includeParentEvents],
    queryFn: async () => {
      if (!user) {
        console.warn('Usuário não autenticado');
        return [];
      }

      try {
        // Para admins ou quando incluindo eventos pai, usar consulta direta
        if (options.includeParentEvents) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id as any)
            .single();

          const isAdmin = (profile as any)?.role === 'admin';

          if (isAdmin) {
            // Admins veem todos os eventos
            const { data, error } = await supabase
              .from('events')
              .select('*')
              .eq('is_recurring', false as any)
              .order('start_time', { ascending: true });

            if (error) {
              console.error('Erro ao buscar eventos (admin):', error);
              throw error;
            }

            return (data as unknown as Event[]) || [];
          }
        }

        // Para usuários normais, usar função específica
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role_id')
          .eq('id', user.id as any)
          .single();

        const userRoleId = (userProfile as any)?.role_id;

        if (!userRoleId) {
          console.warn('Role do usuário não encontrada');
          return [];
        }

        // Buscar eventos sem recorrência primeiro
        const { data: regularEvents, error: regularError } = await supabase
          .from('events')
          .select('*')
          .eq('is_recurring', false as any)
          .order('start_time', { ascending: true });

        if (regularError) {
          console.error('Erro ao buscar eventos regulares:', regularError);
          throw regularError;
        }

        // Buscar eventos recorrentes e expandir
        const { data: recurringEvents, error: recurringError } = await supabase
          .from('events')
          .select('*')
          .eq('is_recurring', true as any)
          .is('parent_event_id', null);

        if (recurringError) {
          console.error('Erro ao buscar eventos recorrentes:', recurringError);
          throw recurringError;
        }

        const expandedEvents: Event[] = [];
        
        if (recurringEvents) {
          for (const event of recurringEvents) {
            const eventData = event as any;
            const startDate = new Date(eventData.start_time);
            const endDate = new Date(eventData.end_time);
            const duration = endDate.getTime() - startDate.getTime();

            // Gerar instâncias para os próximos 3 meses
            const now = new Date();
            const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

            let currentDate = new Date(startDate);
            let instanceCount = 0;

            while (currentDate <= threeMonthsFromNow && instanceCount < 50) {
              if (currentDate >= now) {
                const instanceStart = new Date(currentDate);
                const instanceEnd = new Date(instanceStart.getTime() + duration);

                expandedEvents.push({
                  ...eventData,
                  id: `${eventData.id}-${instanceStart.toISOString()}`,
                  start_time: instanceStart.toISOString(),
                  end_time: instanceEnd.toISOString(),
                  parent_event_id: eventData.id
                } as Event);
              }

              // Calcular próxima ocorrência baseada no padrão
              switch (eventData.recurrence_pattern) {
                case 'daily':
                  currentDate.setDate(currentDate.getDate() + (eventData.recurrence_interval || 1));
                  break;
                case 'weekly':
                  currentDate.setDate(currentDate.getDate() + 7 * (eventData.recurrence_interval || 1));
                  break;
                case 'monthly':
                  currentDate.setMonth(currentDate.getMonth() + (eventData.recurrence_interval || 1));
                  break;
                default:
                  break;
              }

              instanceCount++;
            }
          }
        }

        const allEvents = [...(regularEvents as unknown as Event[]), ...expandedEvents];
        return allEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        throw error;
      }
    },
    enabled: !!user
  });

  return {
    data: events,
    isLoading,
    error,
    refetch,
    selectedEvent,
    setSelectedEvent
  };
};
