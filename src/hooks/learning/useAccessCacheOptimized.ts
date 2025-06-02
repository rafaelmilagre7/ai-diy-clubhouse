
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface AccessCacheConfig {
  ttl?: number; // Time to live em milissegundos
  maxEntries?: number;
  enablePersistence?: boolean;
}

export const useAccessCacheOptimized = (config: AccessCacheConfig = {}) => {
  const { user } = useAuth();
  const { ttl = 5 * 60 * 1000, maxEntries = 100, enablePersistence = true } = config;
  
  const [cache, setCache] = useState<Map<string, CacheEntry<any>>>(new Map());

  // Chave única para o usuário
  const getCacheKey = useCallback((key: string) => {
    return `${user?.id || 'guest'}_${key}`;
  }, [user?.id]);

  // Carregar cache do localStorage na inicialização
  useEffect(() => {
    if (!enablePersistence || typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('access_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        const restoredCache = new Map();
        
        Object.entries(parsed).forEach(([key, value]: [string, any]) => {
          if (value.expiresAt > Date.now()) {
            restoredCache.set(key, value);
          }
        });
        
        setCache(restoredCache);
        console.log(`🔄 Cache restaurado: ${restoredCache.size} entradas`);
      }
    } catch (error) {
      console.error('Erro ao restaurar cache:', error);
    }
  }, [enablePersistence]);

  // Salvar cache no localStorage
  const persistCache = useCallback((cacheMap: Map<string, CacheEntry<any>>) => {
    if (!enablePersistence || typeof window === 'undefined') return;

    try {
      const cacheObject = Object.fromEntries(cacheMap);
      localStorage.setItem('access_cache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Erro ao persistir cache:', error);
    }
  }, [enablePersistence]);

  // Limpar entradas expiradas
  const cleanExpiredEntries = useCallback(() => {
    const now = Date.now();
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      let removedCount = 0;
      
      for (const [key, entry] of newCache.entries()) {
        if (now > entry.expiresAt) {
          newCache.delete(key);
          removedCount++;
        }
      }
      
      if (removedCount > 0) {
        console.log(`🗑️ Cache: ${removedCount} entradas expiradas removidas`);
        persistCache(newCache);
      }
      
      return newCache;
    });
  }, [persistCache]);

  // Limpar entradas expiradas periodicamente
  useEffect(() => {
    const interval = setInterval(cleanExpiredEntries, 60000); // A cada minuto
    return () => clearInterval(interval);
  }, [cleanExpiredEntries]);

  const get = useCallback(<T,>(key: string): T | null => {
    const cacheKey = getCacheKey(key);
    const entry = cache.get(cacheKey);
    
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(cacheKey);
        persistCache(newCache);
        return newCache;
      });
      return null;
    }

    console.log(`🎯 Cache hit: ${key}`);
    return entry.data;
  }, [cache, getCacheKey, persistCache]);

  const set = useCallback(<T,>(key: string, data: T) => {
    const cacheKey = getCacheKey(key);
    const now = Date.now();
    const entry: CacheEntry<T> = {
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
      
      newCache.set(cacheKey, entry);
      persistCache(newCache);
      console.log(`💾 Cache set: ${key}`);
      return newCache;
    });
  }, [getCacheKey, ttl, maxEntries, persistCache]);

  const remove = useCallback((key: string) => {
    const cacheKey = getCacheKey(key);
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(cacheKey);
      persistCache(newCache);
      console.log(`🗑️ Cache removido: ${key}`);
      return newCache;
    });
  }, [getCacheKey, persistCache]);

  const clear = useCallback(() => {
    setCache(new Map());
    if (enablePersistence && typeof window !== 'undefined') {
      localStorage.removeItem('access_cache');
    }
    console.log('🗑️ Cache completamente limpo');
  }, [enablePersistence]);

  const invalidatePattern = useCallback((pattern: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      let removedCount = 0;
      
      for (const key of newCache.keys()) {
        if (key.includes(pattern)) {
          newCache.delete(key);
          removedCount++;
        }
      }
      
      if (removedCount > 0) {
        persistCache(newCache);
        console.log(`🗑️ Cache: ${removedCount} entradas invalidadas (padrão: ${pattern})`);
      }
      
      return newCache;
    });
  }, [persistCache]);

  return { 
    get, 
    set, 
    remove, 
    clear, 
    invalidatePattern,
    size: cache.size,
    stats: {
      totalEntries: cache.size,
      userKey: user?.id || 'guest'
    }
  };
};
