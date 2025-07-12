import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface ConnectionNotification {
  id: string;
  user_id: string;
  sender_id: string;
  type: 'connection_request' | 'connection_accepted';
  is_read: boolean;
  created_at: string;
  sender: {
    id: string;
    name: string;
    email: string;
    company_name?: string;
    current_position?: string;
    avatar_url?: string;
  };
}

export const useConnectionNotifications = () => {
  const queryClient = useQueryClient();

  // Buscar notificações do usuário
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['connection-notifications'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('connection_notifications')
        .select(`
          *,
          sender:profiles!connection_notifications_sender_id_fkey(
            id, name, email, company_name, current_position, avatar_url
          )
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ConnectionNotification[];
    },
  });

  // Configurar Realtime para atualizações instantâneas
  useEffect(() => {
    const channel = supabase
      .channel('connection-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connection_notifications'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['connection-notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);


  // Marcar notificação como lida
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('connection_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-notifications'] });
    }
  });

  // Marcar todas como lidas
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('connection_notifications')
        .update({ is_read: true })
        .eq('user_id', user.user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-notifications'] });
    }
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return {
    notifications: notifications || [],
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  };
};