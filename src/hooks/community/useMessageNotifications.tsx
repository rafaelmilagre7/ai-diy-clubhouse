
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useEffect } from 'react';

export const useMessageNotifications = () => {
  const { user } = useAuth();

  // Contar mensagens não lidas
  const { data: unreadCount = 0, refetch } = useQuery({
    queryKey: ['unread-messages-count', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Revalidar a cada 30 segundos
  });

  // Configurar realtime para mensagens
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  return {
    unreadCount,
    refetch
  };
};
