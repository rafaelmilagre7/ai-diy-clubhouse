import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook para mensagens diretas em tempo real
 * Fase 3: Chat instantâneo com typing indicators
 * 
 * Características:
 * - Canal: chat:${userId}
 * - Escuta INSERT e UPDATE em direct_messages
 * - Filtra por sender_id ou recipient_id
 * - Invalidar queries do React Query
 * - Som para novas mensagens
 */

interface UseRealtimeDirectMessagesOptions {
  enableSound?: boolean;
  enableToast?: boolean;
}

export function useRealtimeDirectMessages({
  enableSound = true,
  enableToast = false, // Desabilitado por padrão para não ficar chato
}: UseRealtimeDirectMessagesOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // Handler para nova mensagem
  const handleNewMessage = useCallback((payload: any) => {
    console.log('💬 Nova mensagem recebida:', payload);

    // Se não for do usuário atual (mensagem recebida)
    if (payload.sender_id !== user?.id) {
      // Invalidar queries de mensagens
      queryClient.invalidateQueries({ queryKey: ['direct-messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });

      // Som
      if (enableSound) {
        const audio = new Audio('/sounds/message.mp3');
        audio.volume = 0.3;
        audio.play().catch(err => console.log('Erro ao tocar som:', err));
      }

      // Toast opcional
      if (enableToast) {
        toast.info('Nova mensagem', {
          description: payload.content?.substring(0, 50) + '...',
          duration: 3000,
        });
      }
    }
  }, [user?.id, queryClient, enableSound, enableToast]);

  // Handler para mensagem atualizada (read receipts)
  const handleMessageUpdate = useCallback((payload: any) => {
    console.log('📖 Mensagem atualizada:', payload);

    // Invalidar queries
    queryClient.invalidateQueries({ queryKey: ['direct-messages'] });
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }, [queryClient]);

  // Conexão Realtime
  useEffect(() => {
    if (!user?.id) {
      console.log('⏸️ useRealtimeDirectMessages: Sem usuário autenticado');
      return;
    }

    const channelName = `chat:${user.id}`;
    console.log('🔌 Conectando ao canal de chat:', channelName);

    const channel = supabase
      .channel(channelName)
      // Escutar INSERT (novas mensagens)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('💬 Nova mensagem recebida:', payload);

          // Se não for do usuário atual (mensagem recebida)
          if (payload.new.sender_id !== user?.id) {
            // Invalidar queries de mensagens
            queryClient.invalidateQueries({ queryKey: ['direct-messages'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });

            // Som
            if (enableSound) {
              const audio = new Audio('/sounds/message.mp3');
              audio.volume = 0.3;
              audio.play().catch(err => console.log('Erro ao tocar som:', err));
            }

            // Toast opcional
            if (enableToast) {
              toast.info('Nova mensagem', {
                description: payload.new.content?.substring(0, 50) + '...',
                duration: 3000,
              });
            }
          }
        }
      )
      // Escutar UPDATE (read receipts, edições)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages',
          filter: `sender_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('📖 Mensagem atualizada:', payload);

          // Invalidar queries
          queryClient.invalidateQueries({ queryKey: ['direct-messages'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Status chat:', status);
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('✅ Canal de chat conectado');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false);
          console.error('❌ Erro no canal de chat');
        } else if (status === 'CLOSED') {
          setIsConnected(false);
          console.log('🔌 Canal de chat fechado');
        }
      });

    // Cleanup
    return () => {
      console.log('🧹 Limpando canal de chat');
      setIsConnected(false);
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // ✅ APENAS user?.id

  return {
    isConnected,
  };
}
