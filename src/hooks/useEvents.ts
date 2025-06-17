
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/types/events';

interface UseEventsOptions {
  includeParentEvents?: boolean; // Para área administrativa
}

export const useEvents = (options: UseEventsOptions = {}) => {
  const { includeParentEvents = false } = options;
  
  return useQuery({
    queryKey: ['events', includeParentEvents],
    queryFn: async (): Promise<Event[]> => {
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (!user.user) {
          console.log("Usuário não autenticado");
          return [];
        }

        // Primeiro, tentar buscar eventos usando a função RPC se disponível
        try {
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_visible_events_for_user', { 
              user_id: user.user.id 
            });

          if (!rpcError && rpcData) {
            console.log("Eventos obtidos via RPC:", rpcData.length);
            let filteredEvents = rpcData as Event[];
            
            // Filtrar eventos pai recorrentes se não estiver na administração
            if (!includeParentEvents) {
              filteredEvents = filteredEvents.filter(event => !event.is_recurring);
            }
            
            return filteredEvents;
          }
        } catch (rpcError) {
          console.log("RPC get_visible_events_for_user não disponível, usando fallback");
        }

        // Fallback: buscar eventos diretamente com lógica de visibilidade
        console.log("Usando query direta com fallback");
        
        // Verificar se o usuário é admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.user.id)
          .single();

        const isAdmin = profile?.role === 'admin';

        if (isAdmin) {
          // Admins veem todos os eventos
          let query = supabase
            .from('events')
            .select('*')
            .order('start_time', { ascending: true });

          // Se não incluir eventos pai, filtrar eventos recorrentes pai
          if (!includeParentEvents) {
            query = query.eq('is_recurring', false);
          }

          const { data: events, error } = await query;

          if (error) {
            console.error("Erro ao buscar eventos para admin:", error);
            throw error;
          }

          console.log("Eventos para admin:", events?.length || 0);
          return events as Event[];
        } else {
          // Membros veem eventos públicos ou com acesso específico para seu role
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('role_id')
            .eq('id', user.user.id)
            .single();

          const userRoleId = userProfile?.role_id;

          // Buscar eventos que são públicos ou que têm controle de acesso específico
          let query = supabase
            .from('events')
            .select(`
              *,
              event_access_control!left(role_id)
            `)
            .order('start_time', { ascending: true });

          // Sempre filtrar eventos pai recorrentes para membros
          query = query.eq('is_recurring', false);

          const { data: events, error } = await query;

          if (error) {
            console.error("Erro ao buscar eventos para membro:", error);
            throw error;
          }

          // Filtrar eventos baseado na lógica de visibilidade
          const visibleEvents = events?.filter(event => {
            const accessControls = (event as any).event_access_control || [];
            
            // Se não há controle de acesso, o evento é público
            if (accessControls.length === 0) {
              return true;
            }
            
            // Se há controle de acesso, verificar se o role do usuário está incluído
            if (userRoleId) {
              return accessControls.some((ac: any) => ac.role_id === userRoleId);
            }
            
            return false;
          }) || [];

          // Para eventos recorrentes, buscar também as instâncias geradas (próximos 6 meses)
          const sixMonthsFromNow = new Date();
          sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
          
          const futureInstances = visibleEvents.filter(event => {
            const eventDate = new Date(event.start_time);
            return eventDate <= sixMonthsFromNow;
          });

          console.log("Eventos visíveis para membro:", futureInstances.length);
          return futureInstances as Event[];
        }

      } catch (error) {
        console.error("Erro na busca de eventos:", error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
