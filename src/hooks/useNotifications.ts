
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useNotificationSound } from './useNotificationSound';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
  data?: Record<string, any>;
  priority?: number;
  category?: string;
  action_url?: string;
  grouped_with?: string;
  read_at?: string;
  grouped_count?: number;
  grouped_ids?: string[];
}

// Função para agrupar notificações similares
const groupNotifications = (notifications: Notification[]): Notification[] => {
  const grouped: Map<string, Notification> = new Map();
  
  notifications.forEach(notification => {
    // Criar chave para agrupamento baseada em type, action_url e se é não lida
    const groupKey = `${notification.type}-${notification.action_url}-${notification.is_read}`;
    
    if (grouped.has(groupKey)) {
      const existing = grouped.get(groupKey)!;
      existing.grouped_count = (existing.grouped_count || 1) + 1;
      existing.grouped_ids = [...(existing.grouped_ids || [existing.id]), notification.id];
      
      // Atualizar título para refletir o agrupamento
      if (notification.type === 'comment_liked') {
        existing.title = `${existing.grouped_count} pessoas curtiram seu comentário`;
      } else if (notification.type === 'comment_replied') {
        existing.title = `${existing.grouped_count} novas respostas no seu comentário`;
      }
    } else {
      grouped.set(groupKey, {
        ...notification,
        grouped_count: 1,
        grouped_ids: [notification.id]
      });
    }
  });
  
  return Array.from(grouped.values()).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { playSound } = useNotificationSound();

  // Buscar notificações do usuário
  const { data: rawNotifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Agrupar notificações similares
  const notifications = React.useMemo(() => 
    groupNotifications(rawNotifications), 
    [rawNotifications]
  );

  // Marcar notificação como lida (pode ser um grupo)
  const markAsRead = useMutation({
    mutationFn: async (notificationIdOrIds: string | string[]) => {
      const ids = Array.isArray(notificationIdOrIds) ? notificationIdOrIds : [notificationIdOrIds];
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao marcar notificação como lida: ' + error.message);
    },
  });

  // Marcar todas as notificações como lidas
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Todas as notificações foram marcadas como lidas');
    },
    onError: (error: any) => {
      toast.error('Erro ao marcar notificações como lidas: ' + error.message);
    },
  });

  // Deletar notificação
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao deletar notificação: ' + error.message);
    },
  });

  // Contar notificações não lidas
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Configurar real-time para novas notificações
  React.useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          // Tocar som de notificação
          playSound();
          
          // Mostrar toast para notificações importantes
          const newNotification = payload.new as Notification;
          if (newNotification.type === 'community_reply') {
            toast.info(newNotification.title, {
              description: newNotification.message,
              action: {
                label: 'Ver',
                onClick: () => {
                  const topicId = newNotification.data?.topic_id;
                  if (topicId) {
                    window.location.href = `/community/topic/${topicId}`;
                  }
                }
              }
            });
          } else if (newNotification.type === 'admin_communication' || newNotification.type === 'urgent') {
            toast.info(newNotification.title, {
              description: newNotification.message,
            });
          } else if (newNotification.type === 'comment_liked' || newNotification.type === 'comment_replied') {
            toast.info(newNotification.title, {
              description: newNotification.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: markAsRead.mutateAsync,
    markAllAsRead: markAllAsRead.mutateAsync,
    deleteNotification: deleteNotification.mutateAsync,
    isMarkingAsRead: markAsRead.isPending,
    isMarkingAllAsRead: markAllAsRead.isPending,
    isDeletingNotification: deleteNotification.isPending,
  };
};
