import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useRealtimeConnection } from './useRealtimeConnection';

export interface UserPresence {
  user_id: string;
  online_at: string;
  user_info?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface PresenceState {
  [key: string]: UserPresence[];
}

export function usePresence() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceState>({});
  const [myPresence, setMyPresence] = useState<UserPresence | null>(null);

  // Conexão ao canal de presença global
  const { channel, status } = useRealtimeConnection({
    channelName: 'presence:global',
    onConnect: () => {
      console.log('✅ [PRESENCE] Canal de presença conectado');
    },
  });

  // Atualizar minha presença
  const updatePresence = useCallback(
    async (additionalData?: Record<string, any>) => {
      if (!channel || !user) return;

      const presence: UserPresence = {
        user_id: user.id,
        online_at: new Date().toISOString(),
        user_info: {
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url,
          ...additionalData,
        },
      };

      setMyPresence(presence);

      await channel.track(presence);
      console.log('👤 [PRESENCE] Presença atualizada:', presence);
    },
    [channel, user]
  );

  // Configurar listeners de presença
  useEffect(() => {
    if (!channel) return;

    // Sync: estado completo de presença
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<UserPresence>();
      console.log('🔄 [PRESENCE] Sync:', state);
      setOnlineUsers(state);
    });

    // Join: novo usuário online
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('👋 [PRESENCE] Join:', key, newPresences);
      setOnlineUsers((prev) => ({
        ...prev,
        [key]: newPresences as unknown as UserPresence[],
      }));
    });

    // Leave: usuário saiu
    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('👋 [PRESENCE] Leave:', key, leftPresences);
      setOnlineUsers((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    });

    // Atualizar presença quando conectar
    if (status.isConnected && user) {
      updatePresence();
    }
  }, [channel, status.isConnected, user, updatePresence]);

  // Atualizar presença periodicamente (a cada 30 segundos)
  useEffect(() => {
    if (!status.isConnected) return;

    const interval = setInterval(() => {
      updatePresence();
    }, 30000);

    return () => clearInterval(interval);
  }, [status.isConnected, updatePresence]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (channel && user) {
        channel.untrack();
      }
    };
  }, [channel, user]);

  // Helpers
  const isUserOnline = useCallback(
    (userId: string): boolean => {
      return Object.values(onlineUsers).some((presences) =>
        presences.some((p) => p.user_id === userId)
      );
    },
    [onlineUsers]
  );

  const getUserLastSeen = useCallback(
    (userId: string): Date | null => {
      for (const presences of Object.values(onlineUsers)) {
        const userPresence = presences.find((p) => p.user_id === userId);
        if (userPresence) {
          return new Date(userPresence.online_at);
        }
      }
      return null;
    },
    [onlineUsers]
  );

  const getOnlineUsersList = useCallback((): UserPresence[] => {
    const users: UserPresence[] = [];
    Object.values(onlineUsers).forEach((presences) => {
      users.push(...presences);
    });
    return users;
  }, [onlineUsers]);

  const getOnlineCount = useCallback((): number => {
    return getOnlineUsersList().length;
  }, [getOnlineUsersList]);

  return {
    onlineUsers,
    myPresence,
    isConnected: status.isConnected,
    updatePresence,
    isUserOnline,
    getUserLastSeen,
    getOnlineUsersList,
    getOnlineCount,
  };
}
