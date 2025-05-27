
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  // Dados do remetente
  sender?: {
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
  // Dados do outro participante
  other_participant?: {
    id: string;
    name: string;
    company_name?: string;
    avatar_url?: string;
  };
  // Última mensagem
  last_message?: string;
  unread_count?: number;
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1:profiles!conversations_participant_1_id_fkey(
            id, name, company_name, avatar_url
          ),
          participant_2:profiles!conversations_participant_2_id_fkey(
            id, name, company_name, avatar_url
          )
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Buscar última mensagem e contagem de não lidas para cada conversa
      const conversationsWithDetails = await Promise.all(
        data.map(async (conversation) => {
          // Última mensagem
          const { data: lastMessage } = await supabase
            .from('direct_messages')
            .select('content')
            .or(`
              and(sender_id.eq.${conversation.participant_1_id},recipient_id.eq.${conversation.participant_2_id}),
              and(sender_id.eq.${conversation.participant_2_id},recipient_id.eq.${conversation.participant_1_id})
            `)
            .order('created_at', { ascending: false })
            .limit(1);

          // Contagem de mensagens não lidas
          const { count: unreadCount } = await supabase
            .from('direct_messages')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', user.id)
            .eq('is_read', false)
            .or(`sender_id.eq.${conversation.participant_1_id},sender_id.eq.${conversation.participant_2_id}`);

          return {
            ...conversation,
            other_participant: conversation.participant_1_id === user.id 
              ? conversation.participant_2 
              : conversation.participant_1,
            last_message: lastMessage?.[0]?.content || '',
            unread_count: unreadCount || 0
          };
        })
      );

      return conversationsWithDetails as Conversation[];
    },
    staleTime: 30 * 1000, // 30 segundos
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      // Buscar participantes da conversa
      const { data: conversation } = await supabase
        .from('conversations')
        .select('participant_1_id, participant_2_id')
        .eq('id', conversationId)
        .single();

      if (!conversation) return [];

      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:profiles!direct_messages_sender_id_fkey(
            id, name, avatar_url
          )
        `)
        .or(`
          and(sender_id.eq.${conversation.participant_1_id},recipient_id.eq.${conversation.participant_2_id}),
          and(sender_id.eq.${conversation.participant_2_id},recipient_id.eq.${conversation.participant_1_id})
        `)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data as DirectMessage[];
    },
    staleTime: 10 * 1000, // 10 segundos
    enabled: !!conversationId
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });
}

export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (senderId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', senderId)
        .eq('is_read', false);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });
}
