import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ConversationPreview {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
}

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      // Buscar todas as mensagens onde o usuário é remetente ou destinatário
      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          created_at,
          is_read,
          sender:profiles!direct_messages_sender_id_fkey(id, name, avatar_url),
          recipient:profiles!direct_messages_recipient_id_fkey(id, name, avatar_url)
        `)
        .or(`sender_id.eq.${user.user.id},recipient_id.eq.${user.user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Agrupar por conversa (usuário único)
      const conversationsMap = new Map<string, ConversationPreview>();

      messages?.forEach((msg: any) => {
        const isCurrentUserSender = msg.sender_id === user.user?.id;
        const otherUserId = isCurrentUserSender ? msg.recipient_id : msg.sender_id;
        const otherUser = isCurrentUserSender ? msg.recipient : msg.sender;

        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            userId: otherUserId,
            userName: otherUser?.name || 'Usuário',
            userAvatar: otherUser?.avatar_url,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unreadCount: 0,
            isOnline: false
          });
        }

        // Contar mensagens não lidas (onde eu sou o destinatário)
        if (!isCurrentUserSender && !msg.is_read) {
          const conv = conversationsMap.get(otherUserId)!;
          conv.unreadCount += 1;
        }
      });

      return Array.from(conversationsMap.values());
    }
  });
};
