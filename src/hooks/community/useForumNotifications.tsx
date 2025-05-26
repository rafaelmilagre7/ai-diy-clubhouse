
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useEffect } from 'react';

export interface ForumNotification {
  id: string;
  user_id: string;
  type: 'reply' | 'mention' | 'solution_marked';
  topic_id?: string;
  post_id?: string;
  triggered_by_user_id: string;
  is_read: boolean;
  created_at: string;
  topic?: {
    id: string;
    title: string;
  };
  post?: {
    id: string;
    content: string;
  };
  triggered_by?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export const useForumNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar notificações do fórum
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['forum-notifications', user?.id],
    queryFn: async (): Promise<ForumNotification[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('forum_notifications')
        .select(`
          *,
          topic:forum_topics(id, title),
          post:forum_posts(id, content),
          triggered_by:profiles!forum_notifications_triggered_by_user_id_fkey(id, name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Marcar notificação como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('forum_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-notifications'] });
    }
  });

  // Marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('forum_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-notifications'] });
    }
  });

  // Configurar realtime para notificações
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('forum-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['forum-notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate
  };
};
