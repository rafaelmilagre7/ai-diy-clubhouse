import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeConnection } from './useRealtimeConnection';

interface LiveUpdate {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  record: any;
}

interface UseRealtimeLiveUpdatesOptions {
  tables: {
    name: string;
    filter?: string;
    queryKeys: string[][];
  }[];
  onUpdate?: (update: LiveUpdate) => void;
}

/**
 * Hook para receber atualizações ao vivo de várias tabelas
 * Exemplos de uso:
 * - Comentários em tempo real
 * - Likes/reações atualizadas
 * - Contador de visualizações
 * - Status de aprovação instantâneo
 */
export function useRealtimeLiveUpdates(options: UseRealtimeLiveUpdatesOptions) {
  const { tables, onUpdate } = options;
  const queryClient = useQueryClient();

  // Conexão ao canal de atualizações ao vivo
  const { channel, status } = useRealtimeConnection({
    channelName: 'live-updates',
    onConnect: () => {
      console.log('✅ [LIVE-UPDATES] Canal conectado');
    },
  });

  // Handler genérico para atualizações
  const handleUpdate = useCallback(
    (table: string, queryKeys: string[][], event: 'INSERT' | 'UPDATE' | 'DELETE') => (payload: any) => {
      console.log(`🔄 [LIVE-UPDATES] ${event} em ${table}:`, payload);

      // Invalidar queries relacionadas
      queryKeys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      // Callback customizado
      onUpdate?.({
        table,
        event,
        record: payload.new || payload.old,
      });
    },
    [queryClient, onUpdate]
  );

  // Inscrever em mudanças de todas as tabelas
  useEffect(() => {
    if (!channel) return;

    console.log('📡 [LIVE-UPDATES] Inscrevendo em atualizações ao vivo:', tables.map(t => t.name));

    tables.forEach((table) => {
      // INSERT
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: table.name,
          ...(table.filter && { filter: table.filter }),
        },
        handleUpdate(table.name, table.queryKeys, 'INSERT')
      );

      // UPDATE
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table.name,
          ...(table.filter && { filter: table.filter }),
        },
        handleUpdate(table.name, table.queryKeys, 'UPDATE')
      );

      // DELETE
      channel.on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: table.name,
          ...(table.filter && { filter: table.filter }),
        },
        handleUpdate(table.name, table.queryKeys, 'DELETE')
      );
    });
  }, [channel, tables, handleUpdate]);

  return {
    isConnected: status.isConnected,
    isReconnecting: status.isReconnecting,
  };
}

/**
 * Hook especializado para comentários em tempo real
 */
export function useRealtimeComments(resourceId: string) {
  return useRealtimeLiveUpdates({
    tables: [
      {
        name: 'comments',
        filter: `resource_id=eq.${resourceId}`,
        queryKeys: [['comments', resourceId]],
      },
    ],
  });
}

/**
 * Hook especializado para likes/reações em tempo real
 */
export function useRealtimeLikes(resourceId: string) {
  return useRealtimeLiveUpdates({
    tables: [
      {
        name: 'likes',
        filter: `resource_id=eq.${resourceId}`,
        queryKeys: [['likes', resourceId]],
      },
      {
        name: 'reactions',
        filter: `resource_id=eq.${resourceId}`,
        queryKeys: [['reactions', resourceId]],
      },
    ],
  });
}

/**
 * Hook especializado para visualizações em tempo real
 */
export function useRealtimeViews(resourceId: string) {
  return useRealtimeLiveUpdates({
    tables: [
      {
        name: 'views',
        filter: `resource_id=eq.${resourceId}`,
        queryKeys: [['views', resourceId]],
      },
    ],
  });
}

/**
 * Hook especializado para status de sugestões em tempo real
 */
export function useRealtimeSuggestionStatus(suggestionId: string) {
  return useRealtimeLiveUpdates({
    tables: [
      {
        name: 'suggestions',
        filter: `id=eq.${suggestionId}`,
        queryKeys: [['suggestion', suggestionId], ['suggestions']],
      },
    ],
  });
}
