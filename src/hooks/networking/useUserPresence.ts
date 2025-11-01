import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

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

    // Buscar last_active do banco de dados
    const fetchLastActive = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('last_active')
        .eq('id', userId)
        .single();

      if (data?.last_active) {
        const lastActiveDate = new Date(data.last_active);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        setPresence({
          isOnline: lastActiveDate > fiveMinutesAgo,
          lastSeen: lastActiveDate,
        });
      }
    };

    fetchLastActive();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchLastActive, 30000);

    return () => {
      clearInterval(interval);
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
