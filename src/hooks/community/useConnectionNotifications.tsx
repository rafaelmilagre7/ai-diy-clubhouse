
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ConnectionNotification {
  id: string;
  user_id: string;
  sender_id: string;
  type: 'request' | 'accepted' | 'rejected';
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export const useConnectionNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ConnectionNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

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
            sender:sender_id(
              id,
              name,
              avatar_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Processar notificações para facilitar o uso
        const processedNotifications = data.map(notification => ({
          ...notification,
          sender_name: notification.sender?.name || 'Usuário',
          sender_avatar: notification.sender?.avatar_url
        }));

        setNotifications(processedNotifications);
        
        // Calcular quantidade de não lidas
        const unread = processedNotifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        toast.error('Não foi possível carregar as notificações');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
    
    // Configurar subscription para atualizações em tempo real
    const channel = supabase
      .channel('connection_notifications')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connection_notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          // Buscar dados do remetente
          fetchSenderInfo(payload.new).then(notification => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(count => count + 1);
            
            // Exibir notificação ao usuário
            const message = getNotificationMessage(notification.type, notification.sender_name || 'Usuário');
            toast.info(message);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Buscar informações do remetente
  const fetchSenderInfo = async (notification: any): Promise<ConnectionNotification> => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', notification.sender_id)
        .single();
      
      return {
        ...notification,
        sender_name: data?.name || 'Usuário',
        sender_avatar: data?.avatar_url
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do remetente:', error);
      return {
        ...notification,
        sender_name: 'Usuário',
        sender_avatar: undefined
      };
    }
  };

  // Obter mensagem para cada tipo de notificação
  const getNotificationMessage = (type: string, senderName: string) => {
    switch (type) {
      case 'request':
        return `${senderName} enviou uma solicitação de conexão`;
      case 'accepted':
        return `${senderName} aceitou sua solicitação de conexão`;
      case 'rejected':
        return `${senderName} rejeitou sua solicitação de conexão`;
      default:
        return `Nova notificação de ${senderName}`;
    }
  };

  // Função para marcar notificações como lidas
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('connection_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      
      // Atualizar contador de não lidas
      setUnreadCount(count => Math.max(0, count - 1));
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
      toast.error('Não foi possível atualizar as notificações');
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
