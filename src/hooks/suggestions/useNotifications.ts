
import { useState } from 'react';

export interface SuggestionNotification {
  id: string;
  user_id: string;
  suggestion_id: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<SuggestionNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const markAsRead = async (notificationId: string) => {
    console.log('Simulando marcar notificação como lida:', notificationId);
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    );
  };

  const markAllAsRead = async () => {
    console.log('Simulando marcar todas notificações como lidas');
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, is_read: true }))
    );
  };

  const refetch = async () => {
    console.log('Simulando refetch de notificações');
  };

  return {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch
  };
};
