import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNetworkingAnalytics } from '@/hooks/useNetworkingAnalytics';

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

export const useDirectMessages = (conversationUserId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logEvent } = useNetworkingAnalytics();

  // Buscar mensagens da conversa
  const { data: messages, isLoading } = useQuery({
    queryKey: ['direct-messages', conversationUserId],
    queryFn: async () => {
      if (!conversationUserId) return [];
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:profiles!direct_messages_sender_id_fkey(id, name, avatar_url),
          recipient:profiles!direct_messages_recipient_id_fkey(id, name, avatar_url)
        `)
        .or(`and(sender_id.eq.${user.user.id},recipient_id.eq.${conversationUserId}),and(sender_id.eq.${conversationUserId},recipient_id.eq.${user.user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as DirectMessage[];
    },
    enabled: !!conversationUserId,
  });

  // Enviar mensagem
  const sendMessage = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.user.id,
          recipient_id: recipientId,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Log evento de mensagem enviada
      logEvent.mutate({
        event_type: 'message_sent',
        partner_id: variables.recipientId,
        event_data: { message_id: data.id, content_length: variables.content.length }
      });

      queryClient.invalidateQueries({ queryKey: ['direct-messages', conversationUserId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive"
      });
    }
  });

  // Marcar mensagens como lidas
  const markAsRead = useMutation({
    mutationFn: async (senderId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('recipient_id', user.user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direct-messages', conversationUserId] });
    }
  });

  // Configurar Realtime para atualizações instantâneas
  useEffect(() => {
    if (!conversationUserId) return;

    const channel = supabase
      .channel('direct-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['direct-messages', conversationUserId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationUserId, queryClient]);

  return {
    messages: messages || [],
    isLoading,
    sendMessage,
    markAsRead
  };
};