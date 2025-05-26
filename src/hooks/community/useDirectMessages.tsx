
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  recipient?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  participant_1?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  participant_2?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  last_message?: DirectMessage;
  unread_count?: number;
}

export const useDirectMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar conversas do usuário
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1:profiles!conversations_participant_1_id_fkey(id, name, avatar_url),
          participant_2:profiles!conversations_participant_2_id_fkey(id, name, avatar_url)
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Para cada conversa, buscar a última mensagem e contar não lidas
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conversation) => {
          // Buscar última mensagem
          const { data: lastMessage } = await supabase
            .from('direct_messages')
            .select('*')
            .or(`and(sender_id.eq.${conversation.participant_1_id},recipient_id.eq.${conversation.participant_2_id}),and(sender_id.eq.${conversation.participant_2_id},recipient_id.eq.${conversation.participant_1_id})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Contar mensagens não lidas
          const otherUserId = conversation.participant_1_id === user.id 
            ? conversation.participant_2_id 
            : conversation.participant_1_id;

          const { count: unreadCount } = await supabase
            .from('direct_messages')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', user.id)
            .eq('sender_id', otherUserId)
            .eq('is_read', false);

          return {
            ...conversation,
            last_message: lastMessage,
            unread_count: unreadCount || 0
          };
        })
      );

      return conversationsWithDetails;
    },
    enabled: !!user?.id
  });

  // Buscar mensagens de uma conversa específica
  const getConversationMessages = (otherUserId: string) => {
    return useQuery({
      queryKey: ['conversation-messages', user?.id, otherUserId],
      queryFn: async (): Promise<DirectMessage[]> => {
        if (!user?.id) return [];

        const { data, error } = await supabase
          .from('direct_messages')
          .select(`
            *,
            sender:profiles!direct_messages_sender_id_fkey(id, name, avatar_url),
            recipient:profiles!direct_messages_recipient_id_fkey(id, name, avatar_url)
          `)
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
      },
      enabled: !!user?.id && !!otherUserId
    });
  };

  // Enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content
        });

      if (error) throw error;
    },
    onSuccess: (_, { recipientId }) => {
      toast.success('Mensagem enviada!');
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', user?.id, recipientId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
    onError: (error) => {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    }
  });

  // Marcar mensagens como lidas
  const markAsReadMutation = useMutation({
    mutationFn: async (senderId: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: (_, senderId) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', user?.id, senderId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    }
  });

  // Configurar realtime para mensagens
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('direct-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `sender_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return {
    conversations,
    conversationsLoading,
    getConversationMessages,
    sendMessage: sendMessageMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    isSending: sendMessageMutation.isPending
  };
};
