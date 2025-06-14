
import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useIntelligentCache } from '../cache/useIntelligentCache';

interface SyncConfig {
  interval: number;
  priority: 'high' | 'medium' | 'low';
  enableOffline: boolean;
  maxRetries: number;
}

const SYNC_CONFIGS: Record<string, SyncConfig> = {
  'dashboard': {
    interval: 5 * 60 * 1000, // 5 minutos
    priority: 'high',
    enableOffline: true,
    maxRetries: 3
  },
  'progress': {
    interval: 2 * 60 * 1000, // 2 minutos
    priority: 'high',
    enableOffline: true,
    maxRetries: 3
  },
  'solutions': {
    interval: 10 * 60 * 1000, // 10 minutos
    priority: 'medium',
    enableOffline: false,
    maxRetries: 2
  },
  'profile': {
    interval: 30 * 60 * 1000, // 30 minutos
    priority: 'low',
    enableOffline: false,
    maxRetries: 1
  }
};

export const useBackgroundSync = () => {
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const { generateCacheKey, backgroundSync } = useIntelligentCache();
  const intervalRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isOnline = useRef(navigator.onLine);

  // Detector de conectividade
  useEffect(() => {
    const handleOnline = () => {
      isOnline.current = true;
      // Sincronizar dados críticos quando voltar online
      ['dashboard', 'progress'].forEach(type => {
        backgroundSync(type);
      });
    };

    const handleOffline = () => {
      isOnline.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [backgroundSync]);

  // Configurar sync automático para um tipo de dados
  const setupAutoSync = useCallback((
    type: string,
    queryFn: () => Promise<any>,
    customConfig?: Partial<SyncConfig>
  ) => {
    if (!user || isLoading) return;

    const config = { ...SYNC_CONFIGS[type], ...customConfig };
    const existingInterval = intervalRefs.current.get(type);

    // Limpar interval existente
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Configurar novo interval baseado na prioridade
    const interval = setInterval(() => {
      // Só sincronizar se estiver online ou se offline sync estiver habilitado
      if (!isOnline.current && !config.enableOffline) return;

      // Verificar se há queries ativas para não interferir
      const hasActiveQueries = queryClient.getQueryCache()
        .findAll({ type: 'active' })
        .some(query => query.queryKey[0] === type);

      if (!hasActiveQueries) {
        // Usar requestIdleCallback para prioridade baixa/média
        const executeSync = () => {
          queryClient.prefetchQuery({
            queryKey: generateCacheKey(type),
            queryFn,
            staleTime: config.interval / 2 // Considerar stale na metade do intervalo
          });
        };

        if (config.priority === 'high') {
          executeSync();
        } else if ('requestIdleCallback' in window) {
          requestIdleCallback(executeSync);
        } else {
          setTimeout(executeSync, config.priority === 'medium' ? 1000 : 2000);
        }
      }
    }, config.interval);

    intervalRefs.current.set(type, interval);
  }, [user, isLoading, queryClient, generateCacheKey]);

  // Parar sync automático
  const stopAutoSync = useCallback((type: string) => {
    const interval = intervalRefs.current.get(type);
    if (interval) {
      clearInterval(interval);
      intervalRefs.current.delete(type);
    }
  }, []);

  // Sync manual com retry logic
  const manualSync = useCallback(async (
    type: string,
    queryFn: () => Promise<any>,
    retries: number = 3
  ) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await queryClient.prefetchQuery({
          queryKey: generateCacheKey(type),
          queryFn
        });
        break;
      } catch (error) {
        if (attempt === retries - 1) {
          console.warn(`Background sync failed for ${type} after ${retries} attempts:`, error);
        } else {
          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }
  }, [queryClient, generateCacheKey]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      intervalRefs.current.forEach(interval => clearInterval(interval));
      intervalRefs.current.clear();
    };
  }, []);

  // Sync crítico quando o usuário muda
  useEffect(() => {
    if (user && !isLoading) {
      // Sync imediato de dados críticos
      backgroundSync('dashboard');
      backgroundSync('progress');
    }
  }, [user, isLoading, backgroundSync]);

  return {
    setupAutoSync,
    stopAutoSync,
    manualSync,
    isOnline: isOnline.current
  };
};
