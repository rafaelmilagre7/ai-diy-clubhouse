import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNotificationSound } from '@/hooks/useNotificationSound';

interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
}

interface UseSimpleNotificationsOptions {
  enableSound?: boolean;
  enableDesktopNotifications?: boolean;
  enableToast?: boolean;
}

/**
 * Hook minimalista para notificações em tempo real
 * Fase 1: Fundação sólida sem abstrações complexas
 * 
 * Características:
 * - Apenas 1 canal: notifications:${userId}
 * - Apenas escuta INSERT em notifications
 * - Dependencies fixas: [user?.id]
 * - Cleanup simples e efetivo
 */
export function useSimpleNotifications({
  enableSound = true,
  enableDesktopNotifications = true,
  enableToast = true,
}: UseSimpleNotificationsOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { playSound } = useNotificationSound();
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Solicitar permissão para notificações desktop
  useEffect(() => {
    if (enableDesktopNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [enableDesktopNotifications]);

  // Handler para nova notificação
  const handleNewNotification = useCallback((payload: NotificationPayload) => {
    console.log('📬 Nova notificação recebida:', payload);

    // Invalidar queries para atualizar contadores
    queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });

    // Toast animado
    if (enableToast) {
      toast.info(payload.title, {
        description: payload.message,
        duration: 5000,
      });
    }

    // Som
    if (enableSound) {
      playSound();
    }

    // Notificação desktop
    if (
      enableDesktopNotifications &&
      'Notification' in window &&
      Notification.permission === 'granted' &&
      document.hidden // Apenas se janela não estiver em foco
    ) {
      new Notification(payload.title, {
        body: payload.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: payload.id,
      });
    }
  }, [queryClient, enableToast, enableSound, enableDesktopNotifications, playSound]);

  // Conexão Realtime
  useEffect(() => {
    if (!user?.id) {
      console.log('⏸️ useSimpleNotifications: Sem usuário autenticado');
      return;
    }

    const channelName = `notifications:${user.id}`;
    console.log('🔌 Conectando ao canal:', channelName);

    setIsReconnecting(true);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as NotificationPayload;
          console.log('📬 Nova notificação recebida:', notification);

          // Invalidar queries para atualizar contadores
          queryClient.invalidateQueries({ queryKey: ['unread-count'] });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });

          // Toast animado
          if (enableToast) {
            toast.info(notification.title, {
              description: notification.message,
              duration: 5000,
            });
          }

          // Som
          if (enableSound) {
            playSound();
          }

          // Notificação desktop
          if (
            enableDesktopNotifications &&
            'Notification' in window &&
            Notification.permission === 'granted' &&
            document.hidden
          ) {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: notification.id,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Status do canal:', status);
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setIsReconnecting(false);
          console.log('✅ Canal conectado com sucesso');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false);
          setIsReconnecting(true);
          console.error('❌ Erro na conexão do canal');
        } else if (status === 'CLOSED') {
          setIsConnected(false);
          setIsReconnecting(false);
          console.log('🔌 Canal fechado');
        }
      });

    // Cleanup simples e efetivo
    return () => {
      console.log('🧹 Limpando canal:', channelName);
      setIsConnected(false);
      setIsReconnecting(false);
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // ✅ APENAS user?.id - funções externas causam reconexões!

  return {
    isConnected,
    isReconnecting,
  };
}
