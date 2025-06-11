
import { useState, useCallback, useRef, useEffect } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live em ms
  maxSize?: number;
  autoRefresh?: boolean;
}

export const useSecurityCache = <T>(options: CacheOptions = {}) => {
  const { ttl = 5 * 60 * 1000, maxSize = 100, autoRefresh = false } = options;
  
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0
  });

  // Limpar entradas expiradas periodicamente
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const cache = cacheRef.current;
      let cleaned = 0;

      for (const [key, entry] of cache.entries()) {
        if (entry.expiresAt <= now) {
          cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        setCacheStats(prev => ({ ...prev, size: cache.size }));
      }
    }, 60000); // Limpar a cada minuto

    return () => clearInterval(cleanupInterval);
  }, []);

  const get = useCallback((key: string): T | null => {
    const cache = cacheRef.current;
    const entry = cache.get(key);
    const now = Date.now();

    if (!entry || entry.expiresAt <= now) {
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      if (entry) cache.delete(key); // Remove entrada expirada
      return null;
    }

    setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    return entry.data;
  }, []);

  const set = useCallback((key: string, data: T): void => {
    const cache = cacheRef.current;
    const now = Date.now();

    // Verificar limite de tamanho
    if (cache.size >= maxSize && !cache.has(key)) {
      // Remover entrada mais antiga
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }

    cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });

    setCacheStats(prev => ({ ...prev, size: cache.size }));
  }, [ttl, maxSize]);

  const remove = useCallback((key: string): boolean => {
    const result = cacheRef.current.delete(key);
    if (result) {
      setCacheStats(prev => ({ ...prev, size: prev.size - 1 }));
    }
    return result;
  }, []);

  const clear = useCallback((): void => {
    cacheRef.current.clear();
    setCacheStats({ hits: 0, misses: 0, size: 0 });
  }, []);

  const has = useCallback((key: string): boolean => {
    const cache = cacheRef.current;
    const entry = cache.get(key);
    const now = Date.now();

    if (!entry || entry.expiresAt <= now) {
      if (entry) cache.delete(key);
      return false;
    }

    return true;
  }, []);

  const getOrSet = useCallback(async (
    key: string, 
    fetcher: () => Promise<T>
  ): Promise<T> => {
    const cached = get(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    set(key, data);
    return data;
  }, [get, set]);

  const getCacheHitRatio = useCallback((): number => {
    const total = cacheStats.hits + cacheStats.misses;
    return total > 0 ? cacheStats.hits / total : 0;
  }, [cacheStats]);

  return {
    get,
    set,
    remove,
    clear,
    has,
    getOrSet,
    stats: cacheStats,
    hitRatio: getCacheHitRatio()
  };
};
