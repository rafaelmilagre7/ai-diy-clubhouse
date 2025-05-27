
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface NetworkingNotification {
  id: string;
  user_id: string;
  type: 'new_matches' | 'connection_request' | 'connection_accepted' | 'match_viewed';
  title: string;
  message: string;
  data: {
    match_count?: number;
    connection_id?: string;
    match_id?: string;
    sender_name?: string;
    month?: string;
  };
  is_read: boolean;
  created_at: string;
  expires_at?: string;
}

export function useNetworkingNotifications() {
  return useQuery({
    queryKey: ['networking-notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['new_matches', 'connection_request', 'connection_accepted', 'match_viewed'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return data as NetworkingNotification[];
    },
    staleTime: 30 * 1000, // 30 segundos
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['networking-notifications-unread-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return 0;
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .in('type', ['new_matches', 'connection_request', 'connection_accepted', 'match_viewed']);

      if (error) {
        throw error;
      }

      return count || 0;
    },
    staleTime: 30 * 1000, // 30 segundos
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networking-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['networking-notifications-unread-count'] });
    }
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .in('type', ['new_matches', 'connection_request', 'connection_accepted', 'match_viewed']);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networking-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['networking-notifications-unread-count'] });
    }
  });
}
