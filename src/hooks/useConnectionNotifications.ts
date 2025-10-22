/**
 * ⚠️ DEPRECATED - Use useNotifications() instead
 * 
 * Este hook foi substituído pelo sistema unificado de notificações.
 * Mantido apenas para compatibilidade temporária.
 * 
 * Migração:
 * ```
 * // ANTES:
 * import { useConnectionNotifications } from '@/hooks/useConnectionNotifications';
 * const { notifications, markAsRead } = useConnectionNotifications();
 * 
 * // DEPOIS:
 * import { useNotificationsByCategory } from '@/hooks/useNotifications';
 * const { notifications, markAsRead } = useNotificationsByCategory('social');
 * ```
 */

import { useNotificationsByCategory } from './useNotifications';
import { useMemo } from 'react';

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

/**
 * @deprecated Use useNotifications({ category: 'social' }) instead
 */
export const useConnectionNotifications = () => {
  console.warn(
    '⚠️ useConnectionNotifications is deprecated. Use useNotifications({ category: "social" }) instead.'
  );

  const {
    notifications: allNotifications,
    isLoading,
    markAsRead: markAsReadUnified,
    markAllAsRead: markAllAsReadUnified,
  } = useNotificationsByCategory('social');

  // Adaptar formato para compatibilidade
  const notifications = useMemo(() => {
    return allNotifications
      .filter(n => n.type === 'connection_request' || n.type === 'connection_accepted')
      .map(n => ({
        id: n.id,
        user_id: n.user_id,
        sender_id: n.actor_id || '',
        type: n.type as 'connection_request' | 'connection_accepted',
        is_read: n.is_read,
        created_at: n.created_at,
        sender: n.actor ? {
          id: n.actor.id,
          name: n.actor.name,
          email: '', // não disponível no novo sistema
          company_name: n.actor.company_name,
          current_position: n.actor.current_position,
          avatar_url: n.actor.avatar_url,
        } : {
          id: '',
          name: 'Desconhecido',
          email: '',
        },
      } as ConnectionNotification));
  }, [allNotifications]);

  const markAsRead = {
    mutate: async (notificationId: string) => {
      await markAsReadUnified([notificationId]);
    },
    mutateAsync: async (notificationId: string) => {
      await markAsReadUnified([notificationId]);
    },
  };

  const markAllAsRead = {
    mutate: async () => {
      await markAllAsReadUnified();
    },
    mutateAsync: async () => {
      await markAllAsReadUnified();
    },
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };
};
