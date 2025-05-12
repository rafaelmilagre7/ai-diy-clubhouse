
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/types/events';

export const useEvents = () => {
  const { data: user } = supabase.auth.getSession();

  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      // Obter o perfil do usuário atual
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role_id')
        .eq('id', user?.user?.id)
        .single();

      if (!profile) {
        throw new Error('Perfil de usuário não encontrado');
      }

      // Obter eventos visíveis para o usuário atual
      // Eventos são visíveis se:
      // 1. Não tiverem controle de acesso (públicos)
      // 2. O usuário tiver um papel que permite acesso
      // 3. O usuário for admin (verificado via função is_admin)
      const { data, error } = await supabase
        .rpc('get_visible_events_for_user', { user_id: profile.id });

      if (error) {
        // Fallback para buscar todos os eventos se a função RPC não existir
        console.warn("RPC não disponível, buscando eventos com método alternativo:", error);
        
        // Verificar se o usuário é admin
        const { data: isAdminData } = await supabase.rpc('is_admin');
        const isAdmin = isAdminData || false;
        
        // Se for admin, retorna todos os eventos
        if (isAdmin) {
          const { data: allEvents, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .order('start_time', { ascending: true });
            
          if (eventsError) throw eventsError;
          return allEvents as Event[];
        }
        
        // Se não for admin, busca eventos públicos e eventos com acesso específico
        const { data: accessibleEvents, error: accessError } = await supabase
          .from('events')
          .select('*')
          .or(`
            id.in.(
              select event_id from event_access_control where role_id = '${profile.role_id}'
            ),
            id.not.in.(select event_id from event_access_control)
          `)
          .order('start_time', { ascending: true });
          
        if (accessError) throw accessError;
        return accessibleEvents as Event[];
      }

      return data as Event[];
    }
  });
};
