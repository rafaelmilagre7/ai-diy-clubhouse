
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useNotificationSound } from './useNotificationSound';
import type { NotificationCategory } from '@/types/notifications';

export interface Notification {
  id: string;
  user_id: string;
  actor_id?: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
  data?: Record<string, any>;
  priority?: string;
  category?: string;
  action_url?: string;
  grouped_with?: string;
  read_at?: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, any>;
  grouped_count?: number;
  grouped_ids?: string[];
  actor?: {
    id: string;
    name: string;
    avatar_url?: string;
    company_name?: string;
    current_position?: string;
  };
  grouped_actors?: any[];
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
      
      // Agrupar avatares (máximo 3)
      if (!existing.grouped_actors) existing.grouped_actors = [];
      if (notification.actor && existing.grouped_actors.length < 3) {
        // Evitar duplicatas
        const actorExists = existing.grouped_actors.some((a: any) => a.id === notification.actor?.id);
        if (!actorExists) {
          existing.grouped_actors.push(notification.actor);
        }
      }
      
      // Atualizar título para refletir o agrupamento
      if (notification.type === 'comment_liked') {
        existing.title = `${existing.grouped_count} pessoas curtiram seu comentário`;
      } else if (notification.type === 'community_post_liked') {
        existing.title = `${existing.grouped_count} pessoas curtiram sua resposta`;
      } else if (notification.type === 'comment_replied') {
        existing.title = `${existing.grouped_count} novas respostas no seu comentário`;
      } else if (notification.type === 'new_lesson') {
        existing.title = `${existing.grouped_count} novas aulas adicionadas`;
      } else if (notification.type === 'new_module') {
        existing.title = `${existing.grouped_count} novos módulos adicionados`;
      } else if (notification.type === 'community_mention') {
        existing.title = `${existing.grouped_count} novas menções`;
      }
      
      // Manter a data mais recente
      if (new Date(notification.created_at) > new Date(existing.created_at)) {
        existing.created_at = notification.created_at;
      }
    } else {
      grouped.set(groupKey, {
        ...notification,
        grouped_count: 1,
        grouped_ids: [notification.id],
        grouped_actors: notification.actor ? [notification.actor] : []
      });
    }
  });
  
  return Array.from(grouped.values()).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const useNotifications = (filters: {
  category?: NotificationCategory;
  unreadOnly?: boolean;
} = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { playSound } = useNotificationSound();

  // Buscar notificações do usuário
  const { data: rawNotifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id, filters?.category, filters?.unreadOnly],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey(
            id, name, avatar_url, company_name, current_position
          )
        `)
        .eq('user_id', user.id)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })
        .limit(100);

      // Aplicar filtros opcionais
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters?.unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

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
          
          // Notificações de alta prioridade (sempre mostram toast)
          if (newNotification.priority === 'high' || 
              ['new_course', 'new_solution', 'suggestion_status_change', 'topic_solved', 
               'official_suggestion_comment', 'certificate_available', 'event_reminder_1h',
               'suggestion_milestone', 'topic_milestone', 'connection_anniversary',
               'ai_recommendation', 'completion_motivation', 'weekly_summary'].includes(newNotification.type)) {
            toast.success(newNotification.title, {
              description: newNotification.message,
              action: newNotification.action_url ? {
                label: 'Ver',
                onClick: () => window.location.href = newNotification.action_url!
              } : undefined
            });
          }
      // Notificações de conexões
      else if (['connection_request', 'connection_accepted'].includes(newNotification.type)) {
        toast.info(newNotification.title, {
          description: newNotification.message,
          action: {
            label: 'Ver',
            onClick: () => {
              if (newNotification.action_url) {
                window.location.href = newNotification.action_url;
              }
            }
          }
        });
      }
      
      // Notificações de novas mensagens
      else if (newNotification.type === 'new_message') {
        toast.info(newNotification.title, {
          description: newNotification.message,
          action: {
            label: 'Ver',
            onClick: () => {
              if (newNotification.action_url) {
                window.location.href = newNotification.action_url;
              }
            }
          }
        });
      }
      
      // Notificações de comunidade
      else if (['community_reply', 'community_mention', 'community_post_liked'].includes(newNotification.type)) {
        toast.info(newNotification.title, {
          description: newNotification.message,
          action: {
            label: 'Ver',
            onClick: () => {
              if (newNotification.action_url) {
                window.location.href = newNotification.action_url;
              }
            }
          }
        });
      }
      
      // Notificações de curtidas e respostas em comentários
      else if (['comment_liked', 'comment_replied'].includes(newNotification.type)) {
        toast.info(newNotification.title, {
          description: newNotification.message,
          action: {
            label: 'Ver',
            onClick: () => {
              if (newNotification.action_url) {
                window.location.href = newNotification.action_url;
              }
            }
          }
        });
      }
          // Notificações de comentários
          else if (newNotification.type === 'comment_liked' || newNotification.type === 'comment_replied') {
            toast.info(newNotification.title, {
              description: newNotification.message,
            });
          }
          // Notificações de aprendizado (prioridade normal)
          else if (['new_lesson', 'new_module'].includes(newNotification.type)) {
            toast.info(newNotification.title, {
              description: newNotification.message,
            });
          }
          // Notificações de eventos
          else if (['event_reminder_24h'].includes(newNotification.type)) {
            toast.info(newNotification.title, {
              description: newNotification.message,
            });
          }
          // Admin e urgentes
          else if (newNotification.type === 'admin_communication' || newNotification.type === 'urgent') {
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

  // Estatísticas por categoria
  const statsByCategory = React.useMemo(() => {
    return rawNotifications.reduce((acc, notif) => {
      const cat = notif.category || 'system';
      if (!acc[cat]) acc[cat] = { total: 0, unread: 0 };
      acc[cat].total++;
      if (!notif.is_read) acc[cat].unread++;
      return acc;
    }, {} as Record<string, { total: number; unread: number }>);
  }, [rawNotifications]);

  return {
    notifications,
    rawNotifications,
    isLoading,
    unreadCount,
    statsByCategory,
    markAsRead: markAsRead.mutateAsync,
    markAllAsRead: markAllAsRead.mutateAsync,
    deleteNotification: deleteNotification.mutateAsync,
    isMarkingAsRead: markAsRead.isPending,
    isMarkingAllAsRead: markAllAsRead.isPending,
    isDeletingNotification: deleteNotification.isPending,
    refetch,
  };
};

/**
 * 🔔 Hook para notificações de uma categoria específica
 */
export const useNotificationsByCategory = (category: NotificationCategory) => {
  return useNotifications({ category });
};

/**
 * 🔔 Hook para apenas notificações não lidas
 */
export const useUnreadNotifications = () => {
  return useNotifications({ unreadOnly: true });
};
