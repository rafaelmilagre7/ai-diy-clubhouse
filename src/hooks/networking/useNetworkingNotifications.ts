
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['networking-notifications-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return 0;
      }

      // Contar notificações não lidas relacionadas ao networking
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .in('type', ['connection_request', 'connection_accepted', 'message']);

      if (error) {
        console.error('Erro ao contar notificações:', error);
        return 0;
      }

      return count || 0;
    },
    staleTime: 30 * 1000, // 30 segundos
  });
}
