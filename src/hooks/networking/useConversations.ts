import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  other_participant: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    company_name: string | null;
    position: string | null;
  };
  last_message?: {
    content: string;
    sender_id: string;
    created_at: string;
    is_read: boolean;
  };
  unread_count: number;
}

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // Buscar conversas do usuário
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1:profiles!conversations_participant_1_id_fkey(
            id, name, avatar_url, company_name, position
          ),
          participant_2:profiles!conversations_participant_2_id_fkey(
            id, name, avatar_url, company_name, position
          )
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Para cada conversa, buscar última mensagem e contagem de não lidas
      const conversationsWithDetails = await Promise.all(
        (conversations || []).map(async (conv) => {
          const otherParticipantId = 
            conv.participant_1_id === user.id ? conv.participant_2_id : conv.participant_1_id;
          
          const otherParticipant = 
            conv.participant_1_id === user.id ? conv.participant_2 : conv.participant_1;

          // Última mensagem
          const { data: lastMessage } = await supabase
            .from('direct_messages')
            .select('content, sender_id, created_at, is_read')
            .or(`sender_id.eq.${conv.participant_1_id},sender_id.eq.${conv.participant_2_id}`)
            .or(`recipient_id.eq.${conv.participant_1_id},recipient_id.eq.${conv.participant_2_id}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Contagem de não lidas
          const { count: unreadCount } = await supabase
            .from('direct_messages')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', user.id)
            .eq('sender_id', otherParticipantId)
            .eq('is_read', false);

          return {
            id: conv.id,
            participant_1_id: conv.participant_1_id,
            participant_2_id: conv.participant_2_id,
            last_message_at: conv.last_message_at,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            other_participant: otherParticipant,
            last_message: lastMessage || undefined,
            unread_count: unreadCount || 0,
          };
        })
      );

      return conversationsWithDetails as Conversation[];
    },
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });
};
