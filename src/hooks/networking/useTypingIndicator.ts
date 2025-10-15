import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useTypingIndicator = (otherUserId: string) => {
  const { user } = useAuth();
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !otherUserId) return;

    const channelName = `typing:${[user.id, otherUserId].sort().join('-')}`;
    const channel = supabase.channel(channelName);

    // Escutar quando outro usuário está digitando
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const otherUserStates = state[otherUserId] || [];
        
        const isOtherUserTyping = otherUserStates.some(
          (s: any) => s.typing === true
        );
        
        if (isOtherUserTyping) {
          setIsTyping(true);
          
          // Auto-desligar após 3 segundos
          if (typingTimeout) clearTimeout(typingTimeout);
          const timeout = setTimeout(() => setIsTyping(false), 3000);
          setTypingTimeout(timeout);
        } else {
          setIsTyping(false);
        }
      })
      .subscribe();

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      supabase.removeChannel(channel);
    };
  }, [user, otherUserId]);

  const sendTypingSignal = () => {
    if (!user || !otherUserId) return;

    const channelName = `typing:${[user.id, otherUserId].sort().join('-')}`;
    const channel = supabase.channel(channelName);

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ typing: true, userId: user.id });
      }
    });

    // Limpar sinal após 3 segundos
    setTimeout(() => {
      channel.untrack();
    }, 3000);
  };

  return { isTyping, sendTypingSignal };
};
