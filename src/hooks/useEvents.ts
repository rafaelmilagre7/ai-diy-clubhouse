
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/types/events';

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      // Obter o usuário atual
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('Usuário não autenticado');
      }

      // Obter o perfil do usuário atual
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role_id')
        .eq('id', userData.user.id)
        .single();

      if (!profile) {
        throw new Error('Perfil de usuário não encontrado');
      }

      try {
        // Tenta usar a função RPC first
        const { data, error } = await supabase
          .rpc('get_visible_events_for_user', { user_id: profile.id });

        // Se não houver erro, retorna os dados
        if (!error) {
          return data as Event[];
        }
        
        // Se houver erro, usa o método fallback abaixo
        console.warn("RPC não disponível, buscando eventos com método alternativo:", error);
      } catch (err) {
        console.error("Erro ao chamar RPC:", err);
        // Continuar com método fallback
      }
      
      // Método fallback se a RPC não estiver disponível
      
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
  });
};
