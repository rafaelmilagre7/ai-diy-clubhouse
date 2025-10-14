import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });
};
