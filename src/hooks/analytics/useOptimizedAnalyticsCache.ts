
import { useCallback, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class AnalyticsCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_ENTRIES = 50;

  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.TTL;
    const now = Date.now();
    
    // Limpar cache se exceder limite
    if (this.cache.size >= this.MAX_ENTRIES) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    // Invalidar chaves que correspondem ao padrão
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remover entradas expiradas
    entries.forEach(([key, entry]) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    });
    
    // Se ainda exceder o limite, remover as mais antigas
    if (this.cache.size >= this.MAX_ENTRIES) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = sortedEntries.slice(0, 10);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hitRate: this.cache.size > 0 ? 1 : 0
    };
  }
}

// Instância global do cache
const analyticsCache = new AnalyticsCache();

export const useOptimizedAnalyticsCache = () => {
  const queryClient = useQueryClient();
  const performanceRef = useRef({
    cacheHits: 0,
    cacheMisses: 0,
    totalRequests: 0
  });

  const getCachedData = useCallback(<T>(key: string): T | null => {
    performanceRef.current.totalRequests++;
    
    const cached = analyticsCache.get<T>(key);
    if (cached) {
      performanceRef.current.cacheHits++;
      return cached;
    }
    
    performanceRef.current.cacheMisses++;
    return null;
  }, []);

  const setCachedData = useCallback(<T>(key: string, data: T, ttl?: number): void => {
    analyticsCache.set(key, data, ttl);
  }, []);

  const invalidateCache = useCallback((pattern?: string): void => {
    analyticsCache.invalidate(pattern);
    
    // Invalidar também no React Query
    if (pattern) {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey.some(key => 
          typeof key === 'string' && key.includes(pattern)
        )
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  }, [queryClient]);

  const getPerformanceStats = useCallback(() => {
    const stats = performanceRef.current;
    const hitRate = stats.totalRequests > 0 
      ? ((stats.cacheHits / stats.totalRequests) * 100).toFixed(2)
      : '0';
    
    return {
      ...stats,
      hitRate: `${hitRate}%`,
      cacheStats: analyticsCache.getStats()
    };
  }, []);

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    getPerformanceStats,
    hasCache: useCallback((key: string) => analyticsCache.has(key), [])
  };
};
