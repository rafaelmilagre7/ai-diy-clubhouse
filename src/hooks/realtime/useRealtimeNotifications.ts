import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useRealtimeConnection } from './useRealtimeConnection';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

interface NotificationPayload {
  id: string;
  user_id: string;
  category: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  status: string;
  created_at: string;
}

interface UseRealtimeNotificationsOptions {
  enableSound?: boolean;
  enableDesktopNotifications?: boolean;
  onNotification?: (notification: NotificationPayload) => void;
}

export function useRealtimeNotifications(options: UseRealtimeNotificationsOptions = {}) {
  const {
    enableSound = true,
    enableDesktopNotifications = true,
    onNotification,
  } = options;

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Criar audio element para notificações
  useEffect(() => {
    if (enableSound && !audioRef.current) {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.5;
    }
  }, [enableSound]);

  // Função para tocar som
  const playNotificationSound = useCallback(() => {
    if (enableSound && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.warn('Erro ao tocar som de notificação:', error);
      });
    }
  }, [enableSound]);

  // Função para mostrar notificação desktop
  const showDesktopNotification = useCallback(
    (notification: NotificationPayload) => {
      if (!enableDesktopNotifications) return;

      if ('Notification' in window && Notification.permission === 'granted') {
        const notif = new Notification(notification.title, {
          body: notification.message,
          icon: '/images/viver-de-ia-logo.png',
          badge: '/images/viver-de-ia-logo.png',
          tag: notification.id,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
          // Navegar para a notificação se necessário
        };
      }
    },
    [enableDesktopNotifications]
  );

  // Pedir permissão para notificações desktop
  useEffect(() => {
    if (enableDesktopNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [enableDesktopNotifications]);

  // Handler para novas notificações
  const handleNewNotification = useCallback(
    (payload: any) => {
      console.log('🔔 [REALTIME] Nova notificação:', payload);

      const notification = payload.new as NotificationPayload;

      // Invalidar queries para atualizar lista
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });

      // Tocar som
      playNotificationSound();

      // Mostrar notificação desktop
      showDesktopNotification(notification);

      // Mostrar toast
      const categoryEmoji = getCategoryEmoji(notification.category);
      toast(notification.title, {
        description: notification.message,
        icon: categoryEmoji,
        duration: 5000,
        action: {
          label: 'Ver',
          onClick: () => {
            // Marcar como lida e navegar
            supabase
              .from('notifications')
              .update({ status: 'read' })
              .eq('id', notification.id)
              .then(() => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
                queryClient.invalidateQueries({ queryKey: ['unread-count'] });
              });
          },
        },
      });

      // Callback customizado
      onNotification?.(notification);
    },
    [queryClient, playNotificationSound, showDesktopNotification, onNotification]
  );

  // Handler para atualizações de notificações
  const handleUpdateNotification = useCallback(() => {
    console.log('🔄 [REALTIME] Notificação atualizada');
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['unread-count'] });
  }, [queryClient]);

  // Handler para deleções de notificações
  const handleDeleteNotification = useCallback(() => {
    console.log('🗑️ [REALTIME] Notificação deletada');
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['unread-count'] });
  }, [queryClient]);

  // Configurar conexão realtime
  const { channel, status } = useRealtimeConnection({
    channelName: `notifications:${user?.id}`,
    onConnect: () => {
      console.log('✅ [REALTIME] Canal de notificações conectado');
    },
    onDisconnect: () => {
      console.warn('⚠️ [REALTIME] Canal de notificações desconectado');
    },
    onError: (error) => {
      console.error('❌ [REALTIME] Erro no canal de notificações:', error);
    },
  });

  // Inscrever em mudanças da tabela notifications
  useEffect(() => {
    if (!channel || !user) return;

    console.log('📡 [REALTIME] Inscrevendo em postgres_changes para notifications');

    // Escutar inserts
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        handleNewNotification
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        handleUpdateNotification
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        handleDeleteNotification
      );

    return () => {
      // Cleanup é feito pelo useRealtimeConnection
    };
  }, [channel, user, handleNewNotification, handleUpdateNotification, handleDeleteNotification]);

  return {
    isConnected: status.isConnected,
    isReconnecting: status.isReconnecting,
    lastHeartbeat: status.lastHeartbeat,
    reconnectAttempts: status.reconnectAttempts,
  };
}

// Helper para obter emoji da categoria
function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    suggestions: '💡',
    networking: '🤝',
    gamification: '🏆',
    learning: '📚',
    system: '⚙️',
    digest: '📊',
  };
  return emojiMap[category] || '🔔';
}
