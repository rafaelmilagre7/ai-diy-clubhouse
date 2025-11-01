import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PresenceState {
  isOnline: boolean;
  lastSeen?: Date;
}

/**
 * Hook para escutar presença em tempo real de um usuário específico
 */
export const useUserPresence = (userId: string) => {
  const [presence, setPresence] = useState<PresenceState>({
    isOnline: false,
  });

  useEffect(() => {
    if (!userId) return;

    let channel: RealtimeChannel;

    const setupPresence = async () => {
      channel = supabase.channel(`presence:${userId}`);

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const isOnline = Object.keys(state).length > 0;
          
          setPresence({
            isOnline,
            lastSeen: isOnline ? new Date() : undefined,
          });
        })
        .on('presence', { event: 'join' }, () => {
          setPresence({
            isOnline: true,
            lastSeen: new Date(),
          });
        })
        .on('presence', { event: 'leave' }, () => {
          setPresence({
            isOnline: false,
            lastSeen: new Date(),
          });
        })
        .subscribe();
    };

    setupPresence();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  return presence;
};

/**
 * Hook para broadcast de presença própria (usar uma única vez no layout principal)
 */
export const useBroadcastPresence = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`presence:${user.id}`, {
      config: { presence: { key: user.id } },
    });

    channel.on('presence', { event: 'sync' }, () => {
      if (import.meta.env.DEV) {
        console.log('✅ Presence synced for user:', user.id);
      }
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      }
    });

    // Heartbeat a cada 30 segundos
    const interval = setInterval(() => {
      channel.track({
        user_id: user.id,
        online_at: new Date().toISOString(),
      });
    }, 30000);

    return () => {
      clearInterval(interval);
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [user]);
};
