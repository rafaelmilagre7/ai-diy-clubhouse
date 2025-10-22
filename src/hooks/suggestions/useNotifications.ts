/**
 * ⚠️ DEPRECATED - Use useNotifications() instead
 * 
 * Este hook foi substituído pelo sistema unificado de notificações.
 * Mantido apenas para compatibilidade temporária.
 * 
 * Migração:
 * ```
 * // ANTES:
 * import { useNotifications } from '@/hooks/suggestions/useNotifications';
 * const { notifications, markAsRead } = useNotifications();
 * 
 * // DEPOIS:
 * import { useNotificationsByCategory } from '@/hooks/useNotifications';
 * const { notifications, markAsRead } = useNotificationsByCategory('suggestions');
 * ```
 */

import { useNotificationsByCategory } from '../useNotifications';
import { useMemo } from 'react';

/**
 * @deprecated Use useNotifications({ category: 'suggestions' }) instead
 */
export const useNotifications = () => {
  console.warn(
    '⚠️ hooks/suggestions/useNotifications is deprecated. Use useNotifications({ category: "suggestions" }) from hooks/useNotifications instead.'
  );

  const {
    notifications: allNotifications,
    isLoading,
    markAsRead: markAsReadUnified,
    markAllAsRead: markAllAsReadUnified,
    refetch,
  } = useNotificationsByCategory('suggestions');

  // Adaptar para formato antigo (compatibilidade)
  const notifications = useMemo(() => {
    return allNotifications.map(n => ({
      id: n.id,
      user_id: n.user_id,
      suggestion_id: n.reference_id || null,
      type: n.type,
      content: n.message,
      is_read: n.is_read,
      created_at: n.created_at,
      suggestion: n.reference_id ? { title: n.title } : null,
      comment: n.metadata?.comment_id ? { content: n.message } : null,
      profiles: n.actor ? {
        name: n.actor.name,
        avatar_url: n.actor.avatar_url,
      } : null,
    }));
  }, [allNotifications]);

  const markAsRead = async (notificationId: string) => {
    await markAsReadUnified([notificationId]);
  };

  const markAllAsRead = async () => {
    await markAllAsReadUnified();
  };

  return {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch,
  };
};
