
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

interface SendMessageData {
  recipientId: string;
  content: string;
}

export const useDirectMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar conversas do usuário
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1:participant_1_id (id, name, avatar_url),
          participant_2:participant_2_id (id, name, avatar_url),
          last_message:direct_messages (content, created_at)
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Função para buscar mensagens de uma conversa específica
  const getConversationMessages = (conversationId: string) => {
    return useQuery({
      queryKey: ['messages', conversationId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('direct_messages')
          .select(`
            *,
            sender:sender_id (id, name, avatar_url),
            recipient:recipient_id (id, name, avatar_url)
          `)
          .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        return data || [];
      },
      enabled: !!user?.id && !!conversationId
    });
  };

  // Enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, content }: SendMessageData) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  return {
    conversations,
    conversationsLoading,
    getConversationMessages,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    markAsRead: markAsReadMutation.mutate
  };
};
