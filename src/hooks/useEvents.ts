
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/types/events';

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      try {
        // Primeiro, tentar buscar eventos usando a função RPC se disponível
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_visible_events_for_user', { 
            user_id: (await supabase.auth.getUser()).data.user?.id 
          });

        if (!rpcError && rpcData) {
          return rpcData as Event[];
        }

        // Fallback: buscar eventos diretamente
        console.log("RPC não disponível, usando query direta");
        
        const { data: events, error } = await supabase
          .from('events')
          .select('*')
          .order('start_time', { ascending: true });

        if (error) {
          console.error("Erro ao buscar eventos:", error);
          throw error;
        }

        return events as Event[];

      } catch (error) {
        console.error("Erro na busca de eventos:", error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 0, // Sem cache para garantir dados atualizados
    refetchOnMount: true, // Sempre buscar dados atualizados
    refetchOnWindowFocus: true // Atualizar quando a janela ganhar foco
  });
};
