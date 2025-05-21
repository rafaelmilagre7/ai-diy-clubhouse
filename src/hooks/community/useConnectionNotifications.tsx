
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ConnectionNotification {
  id: string;
  user_id: string;
  sender_id: string;
  sender_name?: string | null;
  sender_avatar?: string | null;
  type: 'request' | 'accepted' | 'rejected';
  is_read: boolean;
  created_at: string;
}

export const useConnectionNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ConnectionNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('connection_notifications')
          .select(`
            *,
            profiles:sender_id (
              name,
              avatar_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Processar notificações para adicionar informações do perfil
        const processedNotifications: ConnectionNotification[] = (data || []).map(notification => ({
          id: notification.id,
          user_id: notification.user_id,
          sender_id: notification.sender_id,
          sender_name: notification.profiles?.name,
          sender_avatar: notification.profiles?.avatar_url,
          type: notification.type,
          is_read: notification.is_read,
          created_at: notification.created_at
        }));

        setNotifications(processedNotifications);
        
        // Calcular número de notificações não lidas
        const unread = processedNotifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Configurar assinatura de tempo real
    const channel = supabase
      .channel('connection_notifications_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'connection_notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Marcar uma notificação como lida
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('connection_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      
      // Recalcular contagem de não lidas
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Marcar todas as notificações como lidas
  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('connection_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      toast.error('Erro ao marcar notificações como lidas');
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  };
};
