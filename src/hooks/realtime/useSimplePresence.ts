import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  user_id: string;
  name?: string;
  avatar_url?: string;
  online_at: string;
}

interface OnlineUser {
  userId: string;
  name?: string;
  avatarUrl?: string;
  onlineAt: Date;
}

/**
 * Hook minimalista para presença online em tempo real
 * Fase 2: Usar Presence API do Supabase
 * 
 * Características:
 * - Canal global: presence:online-users
 * - Track automático de presença
 * - Heartbeat a cada 30s
 * - Throttle de updates (max 1x/10s)
 */
export function useSimplePresence() {
  const { user, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Atualizar lista de usuários online
  const updateOnlineUsers = useCallback((presences: Record<string, any>) => {
    const users: Record<string, OnlineUser> = {};
    
    Object.entries(presences).forEach(([key, presence]) => {
      const presenceArray = Array.isArray(presence) ? presence : [presence];
      const latest = presenceArray[0];
      
      if (latest) {
        users[key] = {
          userId: latest.user_id,
          name: latest.name,
          avatarUrl: latest.avatar_url,
          onlineAt: new Date(latest.online_at),
        };
      }
    });

    setOnlineUsers(users);
  }, []);

  // Conectar ao canal de presença
  useEffect(() => {
    if (!user?.id) {
      console.log('⏸️ useSimplePresence: Sem usuário autenticado');
      return;
    }

    const channelName = 'presence:online-users';
    console.log('🔌 Conectando ao canal de presença:', channelName);

    const presenceChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        console.log('🔄 Presença sincronizada:', Object.keys(state).length, 'usuários');
        
        // Atualizar usuários online inline
        const users: Record<string, OnlineUser> = {};
        Object.entries(state).forEach(([key, presence]) => {
          const presenceArray = Array.isArray(presence) ? presence : [presence];
          const latest = presenceArray[0] as any;
          if (latest && latest.user_id) {
            users[key] = {
              userId: latest.user_id,
              name: latest.name,
              avatarUrl: latest.avatar_url,
              onlineAt: new Date(latest.online_at),
            };
          }
        });
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('👋 Usuário entrou:', key);
        const state = presenceChannel.presenceState();
        
        // Atualizar inline
        const users: Record<string, OnlineUser> = {};
        Object.entries(state).forEach(([k, presence]) => {
          const presenceArray = Array.isArray(presence) ? presence : [presence];
          const latest = presenceArray[0] as any;
          if (latest && latest.user_id) {
            users[k] = {
              userId: latest.user_id,
              name: latest.name,
              avatarUrl: latest.avatar_url,
              onlineAt: new Date(latest.online_at),
            };
          }
        });
        setOnlineUsers(users);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('👋 Usuário saiu:', key);
        const state = presenceChannel.presenceState();
        
        // Atualizar inline
        const users: Record<string, OnlineUser> = {};
        Object.entries(state).forEach(([k, presence]) => {
          const presenceArray = Array.isArray(presence) ? presence : [presence];
          const latest = presenceArray[0] as any;
          if (latest && latest.user_id) {
            users[k] = {
              userId: latest.user_id,
              name: latest.name,
              avatarUrl: latest.avatar_url,
              onlineAt: new Date(latest.online_at),
            };
          }
        });
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        console.log('📡 Status presença:', status);
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('✅ Canal de presença conectado');

          // Track inicial
          const presenceState: PresenceState = {
            user_id: user.id,
            name: profile?.name,
            avatar_url: profile?.avatar_url,
            online_at: new Date().toISOString(),
          };

          await presenceChannel.track(presenceState);
          console.log('✅ Presença rastreada:', presenceState);
          
          // Heartbeat: atualizar presença a cada 30s
          const heartbeatInterval = setInterval(async () => {
            const updatedState: PresenceState = {
              user_id: user.id,
              name: profile?.name,
              avatar_url: profile?.avatar_url,
              online_at: new Date().toISOString(),
            };
            await presenceChannel.track(updatedState);
            console.log('💓 Heartbeat enviado');
          }, 30000);

          // Salvar interval no canal para cleanup
          (presenceChannel as any)._heartbeatInterval = heartbeatInterval;
          
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false);
          console.error('❌ Erro no canal de presença');
        } else if (status === 'CLOSED') {
          setIsConnected(false);
          console.log('🔌 Canal de presença fechado');
        }
      });

    setChannel(presenceChannel);

    // Cleanup
    return () => {
      console.log('🧹 Limpando canal de presença');
      
      // Limpar heartbeat
      if ((presenceChannel as any)._heartbeatInterval) {
        clearInterval((presenceChannel as any)._heartbeatInterval);
      }
      
      setIsConnected(false);
      setOnlineUsers({});
      supabase.removeChannel(presenceChannel);
    };
  }, [user?.id]); // ✅ APENAS user?.id

  // Verificar se usuário está online
  const isUserOnline = useCallback((userId: string) => {
    return !!onlineUsers[userId];
  }, [onlineUsers]);

  // Obter lista de usuários online
  const getOnlineUsersList = useCallback(() => {
    return Object.values(onlineUsers);
  }, [onlineUsers]);

  // Obter contagem de usuários online
  const getOnlineCount = useCallback(() => {
    return Object.keys(onlineUsers).length;
  }, [onlineUsers]);

  return {
    onlineUsers,
    isConnected,
    isUserOnline,
    getOnlineUsersList,
    getOnlineCount,
  };
}
