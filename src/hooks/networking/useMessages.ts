import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const useMessages = (conversationId?: string, otherUserId?: string) => {
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
        .order('created_at', { ascending: true });

      if (error) throw error;
      return messages as Message[];
    },
    enabled: !!(conversationId || otherUserId),
    refetchInterval: 3000, // Atualizar a cada 3 segundos
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipientId,
      content,
    }: {
      recipientId: string;
      content: string;
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
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      });
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
