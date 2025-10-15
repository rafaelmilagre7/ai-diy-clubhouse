import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PresenceState {
  isOnline: boolean;
  lastSeen?: Date;
}

export const useUserPresence = (userId: string) => {
  const [presence, setPresence] = useState<PresenceState>({
    isOnline: false,
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(`presence:${userId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userState = state[userId];
        
        if (userState && userState.length > 0) {
          setPresence({
            isOnline: true,
            lastSeen: new Date(),
          });
        } else {
          setPresence((prev) => ({
            isOnline: false,
            lastSeen: prev.lastSeen || new Date(),
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return presence;
};

export const useBroadcastPresence = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`presence:${user.id}`);

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          online: true,
          userId: user.id,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      channel.track({
        online: true,
        userId: user.id,
        timestamp: new Date().toISOString(),
      });
    }, 30000);

    return () => {
      clearInterval(interval);
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [user]);
};

import { useAuth } from '@/contexts/auth';
