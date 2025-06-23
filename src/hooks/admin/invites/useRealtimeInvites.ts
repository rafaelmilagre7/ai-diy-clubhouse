
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useInviteCache } from './useInviteCache';
import { Invite } from './types';

export const useRealtimeInvites = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { invalidateInviteData } = useInviteCache();

  useEffect(() => {
    console.log('🔄 [REALTIME-INVITES] Configurando canal real-time');

    const channel = supabase
      .channel('invites-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'invites'
        },
        (payload) => {
          console.log('✅ [REALTIME-INVITES] Novo convite criado:', payload.new);
          invalidateInviteData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'invites'
        },
        (payload) => {
          console.log('🔄 [REALTIME-INVITES] Convite atualizado:', payload.new);
          invalidateInviteData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'invites'
        },
        (payload) => {
          console.log('🗑️ [REALTIME-INVITES] Convite deletado:', payload.old);
          invalidateInviteData();
        }
      )
      .subscribe((status) => {
        console.log('📡 [REALTIME-INVITES] Status da conexão:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('🔌 [REALTIME-INVITES] Desconectando canal');
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [invalidateInviteData]);

  return {
    isConnected
  };
};
