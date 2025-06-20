
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useEventAccessControl = (eventId: string) => {
  const {
    data: accessControl,
    isLoading,
    error
  } = useQuery({
    queryKey: ['event-access-control', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('event_access_control')
        .select(`
          *,
          roles:role_id(*)
        `)
        .eq('event_id', eventId as any);

      if (error) {
        console.error('Erro ao buscar controle de acesso:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!eventId
  });

  return {
    accessControl: accessControl || [],
    isLoading,
    error
  };
};
