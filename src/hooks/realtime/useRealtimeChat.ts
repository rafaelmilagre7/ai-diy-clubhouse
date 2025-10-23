import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useRealtimeConnection } from './useRealtimeConnection';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  read_by: string[];
}

interface TypingUser {
  user_id: string;
  user_info?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface UseRealtimeChatOptions {
  conversationId: string;
  onNewMessage?: (message: Message) => void;
  onTyping?: (users: TypingUser[]) => void;
  enableSound?: boolean;
}

export function useRealtimeChat(options: UseRealtimeChatOptions) {
  const { conversationId, onNewMessage, onTyping, enableSound = true } = options;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Criar audio element para mensagens
  useEffect(() => {
    if (enableSound && !audioRef.current) {
      audioRef.current = new Audio('/sounds/message.mp3');
      audioRef.current.volume = 0.3;
    }
  }, [enableSound]);

  // Função para tocar som de mensagem
  const playMessageSound = useCallback(() => {
    if (enableSound && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.warn('Erro ao tocar som de mensagem:', error);
      });
    }
  }, [enableSound]);

  // Conexão ao canal da conversa
  const { channel, status } = useRealtimeConnection({
    channelName: `chat:${conversationId}`,
    onConnect: () => {
      console.log('✅ [CHAT] Conectado à conversa:', conversationId);
      setIsConnected(true);
    },
    onDisconnect: () => {
      console.warn('⚠️ [CHAT] Desconectado da conversa:', conversationId);
      setIsConnected(false);
    },
  });

  // Handler para novas mensagens
  const handleNewMessage = useCallback(
    (payload: any) => {
      console.log('💬 [CHAT] Nova mensagem:', payload);

      const message = payload.new as Message;

      // Não tocar som para mensagens próprias
      if (message.sender_id !== user?.id) {
        playMessageSound();
      }

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      // Callback customizado
      onNewMessage?.(message);
    },
    [conversationId, user?.id, queryClient, playMessageSound, onNewMessage]
  );

  // Handler para mensagens atualizadas (editadas ou marcadas como lidas)
  const handleUpdateMessage = useCallback(() => {
    console.log('🔄 [CHAT] Mensagem atualizada');
    queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
  }, [conversationId, queryClient]);

  // Handler para mensagens deletadas
  const handleDeleteMessage = useCallback(() => {
    console.log('🗑️ [CHAT] Mensagem deletada');
    queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
  }, [conversationId, queryClient]);

  // Handler para status de "digitando..."
  const handleTypingUpdate = useCallback(
    (payload: any) => {
      console.log('⌨️ [CHAT] Typing update:', payload);

      const participant = payload.new;

      // Ignorar próprio usuário
      if (participant.user_id === user?.id) return;

      if (participant.is_typing) {
        // Adicionar usuário à lista de digitando
        setTypingUsers((prev) => {
          const exists = prev.find((u) => u.user_id === participant.user_id);
          if (exists) return prev;
          
          return [
            ...prev,
            {
              user_id: participant.user_id,
              // TODO: Buscar info do usuário se necessário
            },
          ];
        });
      } else {
        // Remover usuário da lista
        setTypingUsers((prev) => prev.filter((u) => u.user_id !== participant.user_id));
      }
    },
    [user?.id]
  );

  // Inscrever em mudanças
  useEffect(() => {
    if (!channel || !user) return;

    console.log('📡 [CHAT] Inscrevendo em mudanças da conversa:', conversationId);

    // Escutar novas mensagens
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        handleNewMessage
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        handleUpdateMessage
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        handleDeleteMessage
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `conversation_id=eq.${conversationId}`,
        },
        handleTypingUpdate
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, conversationId]); // Apenas quando canal ou conversação mudar

  // Notificar callback de typing
  useEffect(() => {
    onTyping?.(typingUsers);
  }, [typingUsers, onTyping]);

  // Função para enviar mensagem
  const sendMessage = useCallback(
    async (content: string, type: string = 'text', metadata?: Record<string, any>) => {
      if (!user || !content.trim()) return null;

      try {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: content.trim(),
            type,
            metadata,
          })
          .select()
          .single();

        if (error) throw error;

        console.log('✅ [CHAT] Mensagem enviada:', data);
        return data;
      } catch (error) {
        console.error('❌ [CHAT] Erro ao enviar mensagem:', error);
        toast.error('Erro ao enviar mensagem');
        return null;
      }
    },
    [user, conversationId]
  );

  // Função para marcar como "digitando..."
  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!user) return;

      try {
        await supabase
          .from('conversation_participants')
          .update({
            is_typing: isTyping,
            typing_at: isTyping ? new Date().toISOString() : null,
          })
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id);

        console.log(`⌨️ [CHAT] Typing status: ${isTyping}`);
      } catch (error) {
        console.error('❌ [CHAT] Erro ao atualizar typing:', error);
      }
    },
    [user, conversationId]
  );

  // Função para marcar mensagens como lidas
  const markAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await supabase.rpc('mark_messages_as_read', {
        p_conversation_id: conversationId,
        p_user_id: user.id,
      });

      console.log('✅ [CHAT] Mensagens marcadas como lidas');
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (error) {
      console.error('❌ [CHAT] Erro ao marcar como lidas:', error);
    }
  }, [user, conversationId, queryClient]);

  // Função helper para "digitando..." com debounce
  const startTyping = useCallback(() => {
    setTyping(true);

    // Limpar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-desativar após 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 3000);
  }, [setTyping]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTyping(false);
  }, [setTyping]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Limpar status de digitando ao desmontar
      if (user && conversationId) {
        supabase
          .from('conversation_participants')
          .update({ is_typing: false, typing_at: null })
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id)
          .then(() => console.log('🧹 [CHAT] Typing status limpo ao desmontar'));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Apenas ao montar/desmontar

  return {
    isConnected,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
}
