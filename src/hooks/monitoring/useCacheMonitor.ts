import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSyncMonitor } from './useSyncMonitor';
import { useLogging } from '@/hooks/useLogging';

interface CacheEntry {
  queryKey: string[];
  data: any;
  lastUpdated: number;
  accessCount: number;
  component: string;
}

export const useCacheMonitor = () => {
  const queryClient = useQueryClient();
  const { reportSyncIssue } = useSyncMonitor();
  const { log } = useLogging();
  
  const cacheStatsRef = useRef<Map<string, CacheEntry>>(new Map());

  // Registrar acesso ao cache
  const trackCacheAccess = useCallback((
    queryKey: string[],
    component: string,
    data?: any
  ) => {
    const keyString = JSON.stringify(queryKey);
    const now = Date.now();
    
    const existing = cacheStatsRef.current.get(keyString);
    
    if (existing) {
      existing.accessCount += 1;
      existing.lastUpdated = now;
      if (data) existing.data = data;
    } else {
      cacheStatsRef.current.set(keyString, {
        queryKey,
        data,
        lastUpdated: now,
        accessCount: 1,
        component
      });
    }

    // Verificar se os dados estão muito antigos
    if (existing && now - existing.lastUpdated > 10 * 60 * 1000) { // 10 minutos
      reportSyncIssue(
        'stale_data',
        component,
        `Cache muito antigo: ${Math.round((now - existing.lastUpdated) / 60000)} minutos`,
        { queryKey, lastUpdated: existing.lastUpdated },
        'medium'
      );
    }
  }, [reportSyncIssue]);

  // Verificar consistência do cache
  const checkCacheConsistency = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    let totalQueries = 0;
    let staleQueries = 0;
    let errorQueries = 0;
    
    queries.forEach(query => {
      totalQueries++;
      
      if (query.isStale()) {
        staleQueries++;
      }
      
      if (query.state.error) {
        errorQueries++;
        reportSyncIssue(
          'cache_miss',
          'react-query',
          `Query com erro: ${JSON.stringify(query.queryKey)}`,
          { error: query.state.error, queryKey: query.queryKey },
          'high'
        );
      }
    });

    log('Cache consistency check', {
      totalQueries,
      staleQueries,
      errorQueries,
      stalePercentage: totalQueries > 0 ? (staleQueries / totalQueries) * 100 : 0
    });

    // Reportar se muitas queries estão stale
    if (totalQueries > 5 && (staleQueries / totalQueries) > 0.5) {
      reportSyncIssue(
        'stale_data',
        'react-query',
        `Muitas queries stale: ${staleQueries}/${totalQueries}`,
        { stalePercentage: (staleQueries / totalQueries) * 100 },
        'medium'
      );
    }
  }, [queryClient, reportSyncIssue, log]);

  // Invalidar cache específico
  const invalidateCache = useCallback(async (
    queryKey: string[],
    component: string,
    reason: string
  ) => {
    log(`Invalidating cache for ${component}`, { queryKey, reason });
    
    await queryClient.invalidateQueries({ queryKey });
    
    // Remover das estatísticas locais
    const keyString = JSON.stringify(queryKey);
    cacheStatsRef.current.delete(keyString);
    
    reportSyncIssue(
      'cache_miss',
      component,
      `Cache invalidado: ${reason}`,
      { queryKey },
      'low'
    );
  }, [queryClient, reportSyncIssue, log]);

  // Pré-carregar cache
  const prefetchData = useCallback(async (
    queryKey: string[],
    queryFn: () => Promise<any>,
    component: string
  ) => {
    const start = Date.now();
    
    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000 // 5 minutos
      });
      
      const duration = Date.now() - start;
      
      log(`Prefetch successful for ${component}`, { 
        queryKey, 
        duration 
      });
      
      if (duration > 3000) {
        reportSyncIssue(
          'sync_delay',
          component,
          `Prefetch lento: ${duration}ms`,
          { queryKey, duration },
          'medium'
        );
      }
    } catch (error) {
      reportSyncIssue(
        'cache_miss',
        component,
        `Erro no prefetch: ${error}`,
        { queryKey, error: String(error) },
        'high'
      );
    }
  }, [queryClient, reportSyncIssue, log]);

  // Estatísticas do cache
  const getCacheStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const stats = {
      totalQueries: queries.length,
      freshQueries: queries.filter(q => !q.isStale()).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.error).length,
      loadingQueries: queries.filter(q => q.isFetching()).length
    };

    return {
      ...stats,
      hitRate: stats.totalQueries > 0 ? ((stats.freshQueries / stats.totalQueries) * 100).toFixed(1) : '0'
    };
  }, [queryClient]);

  return {
    trackCacheAccess,
    checkCacheConsistency,
    invalidateCache,
    prefetchData,
    getCacheStats,
    
    // Utilitários específicos para learning
    learningUtils: {
      trackProgress: (lessonId: string, userId: string, progress: number) => {
        trackCacheAccess(['learning-progress', lessonId], 'LessonProgress', { progress, userId });
      },
      
      trackCourseAccess: (courseId: string) => {
        trackCacheAccess(['learning-course', courseId], 'CourseDetails');
      },
      
      trackCommentsAccess: (lessonId: string) => {
        trackCacheAccess(['learning-comments', lessonId], 'LessonComments');
      }
    }
  };
};
