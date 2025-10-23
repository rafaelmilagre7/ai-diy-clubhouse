import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook genérico para atualizações ao vivo
 * Fase 4: Likes, comentários, views em tempo real
 * 
 * Características:
 * - Aceita múltiplas tabelas
 * - Escuta INSERT, UPDATE, DELETE
 * - Invalidar queries específicas
 * - Callbacks customizados
 */

interface UseRealtimeLiveUpdatesOptions {
  tables: Array<{
    name: string;
    events?: ('INSERT' | 'UPDATE' | 'DELETE')[];
    filter?: string;
  }>;
  queryKeys?: string[][];
  onUpdate?: (table: string, event: string, payload: any) => void;
}

export function useRealtimeLiveUpdates({
  tables,
  queryKeys = [],
  onUpdate,
}: UseRealtimeLiveUpdatesOptions) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.id || tables.length === 0) {
      console.log('⏸️ useRealtimeLiveUpdates: Sem usuário ou tabelas');
      return;
    }

    const channelName = `live-updates:${user.id}`;
    console.log('🔌 Conectando ao canal de live updates:', channelName);

    let channel = supabase.channel(channelName);

    // Adicionar listeners para cada tabela
    tables.forEach(({ name, events = ['INSERT', 'UPDATE', 'DELETE'], filter }) => {
      events.forEach((event) => {
        const config: any = {
          event,
          schema: 'public',
          table: name,
        };

        if (filter) {
          config.filter = filter;
        }

        channel = channel.on('postgres_changes', config, (payload) => {
          console.log(`📊 Update em ${name} (${event}):`, payload);

          // Callback customizado
          if (onUpdate) {
            onUpdate(name, event, payload);
          }

          // Invalidar queries específicas
          if (queryKeys.length > 0) {
            queryKeys.forEach((queryKey) => {
              queryClient.invalidateQueries({ queryKey });
            });
          }

          // Invalidar queries relacionadas à tabela
          queryClient.invalidateQueries({ queryKey: [name] });
        });
      });
    });

    channel.subscribe((status) => {
      console.log('📡 Status live updates:', status);
      
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        console.log('✅ Canal de live updates conectado');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setIsConnected(false);
        console.error('❌ Erro no canal de live updates');
      } else if (status === 'CLOSED') {
        setIsConnected(false);
        console.log('🔌 Canal de live updates fechado');
      }
    });

    // Cleanup
    return () => {
      console.log('🧹 Limpando canal de live updates');
      setIsConnected(false);
      supabase.removeChannel(channel);
    };
  }, [user?.id, JSON.stringify(tables), JSON.stringify(queryKeys), onUpdate, queryClient]);

  return {
    isConnected,
  };
}

// Hooks especializados para casos comuns

export function useRealtimeComments(resourceId?: string) {
  return useRealtimeLiveUpdates({
    tables: [
      {
        name: 'comments',
        events: ['INSERT', 'UPDATE', 'DELETE'],
        filter: resourceId ? `resource_id=eq.${resourceId}` : undefined,
      },
    ],
    queryKeys: [['comments', resourceId].filter(Boolean)],
  });
}

export function useRealtimeLikes(resourceId?: string) {
  return useRealtimeLiveUpdates({
    tables: [
      {
        name: 'likes',
        events: ['INSERT', 'DELETE'],
        filter: resourceId ? `resource_id=eq.${resourceId}` : undefined,
      },
    ],
    queryKeys: [['likes', resourceId].filter(Boolean)],
  });
}

export function useRealtimeViews(resourceId?: string) {
  return useRealtimeLiveUpdates({
    tables: [
      {
        name: 'views',
        events: ['INSERT'],
        filter: resourceId ? `resource_id=eq.${resourceId}` : undefined,
      },
    ],
    queryKeys: [['views', resourceId].filter(Boolean)],
  });
}
