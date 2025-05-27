
import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { logger } from '@/utils/logger';

interface QueryPerformanceMetric {
  queryKey: string[];
  duration: number;
  status: 'success' | 'error' | 'loading';
  cacheHit: boolean;
  timestamp: number;
  errorMessage?: string;
}

export const useQueryPerformance = () => {
  const queryClient = useQueryClient();
  const { captureMetric } = usePerformanceMonitor();
  const queryMetricsRef = useRef<QueryPerformanceMetric[]>([]);

  // Monitorar performance de uma query específica
  const trackQuery = useCallback((queryKey: string[], startTime: number = Date.now()) => {
    const queryHash = JSON.stringify(queryKey);
    
    return {
      success: (data: any, fromCache: boolean = false) => {
        const duration = Date.now() - startTime;
        const metric: QueryPerformanceMetric = {
          queryKey,
          duration,
          status: 'success',
          cacheHit: fromCache,
          timestamp: Date.now()
        };

        queryMetricsRef.current.push(metric);

        captureMetric({
          name: 'query_duration',
          value: duration,
          context: 'react_query',
          metadata: {
            type: 'query_performance',
            queryKey: queryHash,
            cacheHit: fromCache,
            status: 'success'
          }
        });

        // Alertar queries muito lentas
        if (duration > 5000) {
          logger.warn('Query muito lenta detectada', {
            queryKey: queryHash,
            duration,
            cacheHit: fromCache
          });
        }
      },

      error: (error: any) => {
        const duration = Date.now() - startTime;
        const metric: QueryPerformanceMetric = {
          queryKey,
          duration,
          status: 'error',
          cacheHit: false,
          timestamp: Date.now(),
          errorMessage: error?.message || 'Unknown error'
        };

        queryMetricsRef.current.push(metric);

        captureMetric({
          name: 'query_error',
          value: duration,
          context: 'react_query',
          metadata: {
            type: 'query_error',
            queryKey: queryHash,
            errorMessage: error?.message,
            status: 'error'
          }
        });
      }
    };
  }, [captureMetric]);

  // Obter estatísticas de performance das queries
  const getQueryStats = useCallback(() => {
    const metrics = queryMetricsRef.current;
    const now = Date.now();
    const last24h = metrics.filter(m => now - m.timestamp < 24 * 60 * 60 * 1000);

    const totalQueries = last24h.length;
    const successQueries = last24h.filter(m => m.status === 'success');
    const errorQueries = last24h.filter(m => m.status === 'error');
    const cacheHits = last24h.filter(m => m.cacheHit);

    const durations = successQueries.map(m => m.duration);
    const avgDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    const slowQueries = successQueries.filter(m => m.duration > 2000);

    // Queries mais lentas
    const slowestQueries = [...successQueries]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(m => ({
        queryKey: JSON.stringify(m.queryKey),
        duration: m.duration,
        timestamp: m.timestamp
      }));

    // Queries com mais erros
    const errorStats = errorQueries.reduce((acc, m) => {
      const key = JSON.stringify(m.queryKey);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostErrorQueries = Object.entries(errorStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([queryKey, count]) => ({ queryKey, errorCount: count }));

    return {
      totalQueries,
      successRate: totalQueries > 0 ? (successQueries.length / totalQueries) * 100 : 0,
      errorRate: totalQueries > 0 ? (errorQueries.length / totalQueries) * 100 : 0,
      cacheHitRate: totalQueries > 0 ? (cacheHits.length / totalQueries) * 100 : 0,
      avgDuration,
      slowQueriesCount: slowQueries.length,
      slowestQueries,
      mostErrorQueries,
      last24hCount: totalQueries
    };
  }, []);

  // Monitorar cache do React Query
  const getCacheStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    const stats = {
      totalQueries: queries.length,
      freshQueries: queries.filter(q => q.state.dataUpdatedAt > Date.now() - 5 * 60 * 1000).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.error).length,
      loadingQueries: queries.filter(q => q.state.isFetching).length
    };

    captureMetric({
      name: 'cache_stats',
      value: stats.totalQueries,
      context: 'react_query_cache',
      metadata: {
        type: 'cache_stats',
        ...stats
      }
    });

    return stats;
  }, [queryClient, captureMetric]);

  // Limpar métricas antigas
  const clearOldMetrics = useCallback((olderThanHours: number = 24) => {
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000);
    queryMetricsRef.current = queryMetricsRef.current.filter(m => m.timestamp > cutoff);
  }, []);

  // Detectar queries problemáticas
  const detectProblematicQueries = useCallback(() => {
    const stats = getQueryStats();
    const problems = [];

    if (stats.errorRate > 10) {
      problems.push({
        type: 'high_error_rate',
        message: `Taxa de erro alta: ${stats.errorRate.toFixed(1)}%`,
        severity: 'high'
      });
    }

    if (stats.avgDuration > 3000) {
      problems.push({
        type: 'slow_queries',
        message: `Queries lentas: média de ${stats.avgDuration.toFixed(0)}ms`,
        severity: 'medium'
      });
    }

    if (stats.cacheHitRate < 50) {
      problems.push({
        type: 'low_cache_hit',
        message: `Cache hit rate baixo: ${stats.cacheHitRate.toFixed(1)}%`,
        severity: 'medium'
      });
    }

    return problems;
  }, [getQueryStats]);

  return {
    trackQuery,
    getQueryStats,
    getCacheStats,
    clearOldMetrics,
    detectProblematicQueries
  };
};

export default useQueryPerformance;
