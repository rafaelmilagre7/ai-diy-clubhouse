
import { useState, useEffect, useCallback } from 'react';

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

interface AccessCacheConfig {
  ttl?: number; // Time to live em milissegundos
  maxEntries?: number;
}

export const useAccessCache = (config: AccessCacheConfig = {}) => {
  const { ttl = 5 * 60 * 1000, maxEntries = 100 } = config; // 5 minutos padrão
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());

  // Limpar entradas expiradas periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCache(prevCache => {
        const newCache = new Map(prevCache);
        for (const [key, entry] of newCache.entries()) {
          if (now > entry.expiresAt) {
            newCache.delete(key);
          }
        }
        return newCache;
      });
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, []);

  const get = useCallback((key: string): any | null => {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }

    console.log(`🔄 Cache hit para: ${key}`);
    return entry.data;
  }, [cache]);

  const set = useCallback((key: string, data: any) => {
    const now = Date.now();
    const entry: CacheEntry = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };

    setCache(prev => {
      const newCache = new Map(prev);
      
      // Remover entradas antigas se exceder o limite
      if (newCache.size >= maxEntries) {
        const oldestKey = newCache.keys().next().value;
        newCache.delete(oldestKey);
      }
      
      newCache.set(key, entry);
      console.log(`💾 Cache set para: ${key}`);
      return newCache;
    });
  }, [ttl, maxEntries]);

  const clear = useCallback(() => {
    setCache(new Map());
    console.log('🗑️ Cache limpo');
  }, []);

  const remove = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      console.log(`🗑️ Cache removido para: ${key}`);
      return newCache;
    });
  }, []);

  return { get, set, clear, remove, size: cache.size };
};
