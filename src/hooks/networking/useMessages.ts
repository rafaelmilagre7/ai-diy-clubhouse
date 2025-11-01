import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToastModern } from '@/hooks/useToastModern';
import { useEffect } from 'react';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  delivered_at?: string;
  read_at?: string;
  attachments?: any[];
  reply_to_id?: string;
  edited_at?: string;
  deleted_at?: string;
}

export const useMessages = (conversationId?: string, otherUserId?: string) => {
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    if (!conversationId && !otherUserId) return;

    const channel = supabase
      .channel('direct-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
        },
        () => {
          queryClient.invalidateQueries({ 
            queryKey: ['messages', conversationId, otherUserId] 
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, otherUserId, queryClient]);

  return useQuery({
    queryKey: ['messages', conversationId, otherUserId],
    queryFn: async () => {
      if (!conversationId && !otherUserId) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          otherUserId
            ? `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
            : `sender_id.eq.${user.id},recipient_id.eq.${user.id}`
        )
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return messages as Message[];
    },
    enabled: !!(conversationId || otherUserId),
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { showError } = useToastModern();

  return useMutation({
    mutationFn: async ({
      recipientId,
      content,
      attachments,
      replyToId,
    }: {
      recipientId: string;
      content: string;
      attachments?: any[];
      replyToId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // Verificar se já existe conversa
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(participant_1_id.eq.${user.id},participant_2_id.eq.${recipientId}),and(participant_1_id.eq.${recipientId},participant_2_id.eq.${user.id})`
        )
        .maybeSingle();

      // Se não existe, criar conversa
      if (!existingConversation) {
        const { error: convError } = await supabase
          .from('conversations')
          .insert({
            participant_1_id: user.id,
            participant_2_id: recipientId,
          });

        if (convError) throw convError;
      }

      // Inserir mensagem
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          attachments: attachments || [],
          reply_to_id: replyToId,
          delivered_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // ✅ CORREÇÃO CRÍTICA #3: Criar notificação para nova mensagem
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          actor_id: user.id,
          type: 'new_message',
          category: 'social',
          title: 'Nova mensagem',
          message: content.length > 50 ? content.substring(0, 50) + '...' : content,
          action_url: `/chat?user=${user.id}`,
          priority: 'normal',
          reference_id: data.id,
          reference_type: 'message'
        });

      if (notifError) {
        console.error('Erro ao criar notificação de mensagem:', notifError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
    onError: (error) => {
      showError('Erro ao enviar mensagem', error.message);
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (senderId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', senderId)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
};
