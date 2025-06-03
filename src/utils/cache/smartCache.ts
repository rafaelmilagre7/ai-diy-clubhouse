
import { logger } from '@/utils/logger';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheConfig {
  defaultTtl?: number; // TTL padrão em milissegundos
  maxSize?: number; // Tamanho máximo do cache
  gcInterval?: number; // Intervalo de garbage collection
}

/**
 * Cache inteligente com TTL, LRU e garbage collection
 */
export class SmartCache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private config: Required<CacheConfig>;
  private gcTimer?: NodeJS.Timeout;

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTtl: config.defaultTtl || 5 * 60 * 1000, // 5 minutos
      maxSize: config.maxSize || 100,
      gcInterval: config.gcInterval || 60 * 1000 // 1 minuto
    };

    this.startGarbageCollection();
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTtl);

    // Se o cache está cheio, remover item menos usado
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
      accessCount: 0,
      lastAccessed: now
    });

    logger.debug('Item adicionado ao cache', { key, expiresAt });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();

    // Verificar se expirou
    if (now > item.expiresAt) {
      this.cache.delete(key);
      logger.debug('Item removido do cache (expirado)', { key });
      return null;
    }

    // Atualizar estatísticas de acesso
    item.accessCount++;
    item.lastAccessed = now;

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // Verificar se não expirou
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    logger.debug('Cache limpo completamente');
  }

  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let minAccessCount = Infinity;
    let oldestAccess = Date.now();

    for (const [key, item] of this.cache) {
      if (item.accessCount < minAccessCount || 
          (item.accessCount === minAccessCount && item.lastAccessed < oldestAccess)) {
        minAccessCount = item.accessCount;
        oldestAccess = item.lastAccessed;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      logger.debug('Item removido do cache (LRU)', { key: leastUsedKey });
    }
  }

  private startGarbageCollection(): void {
    this.gcTimer = setInterval(() => {
      this.runGarbageCollection();
    }, this.config.gcInterval);
  }

  private runGarbageCollection(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, item] of this.cache) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.debug('Garbage collection executado', { 
        removedItems: removedCount, 
        remainingItems: this.cache.size 
      });
    }
  }

  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalAccessCount = 0;

    for (const item of this.cache.values()) {
      if (now > item.expiresAt) {
        expiredCount++;
      }
      totalAccessCount += item.accessCount;
    }

    return {
      totalItems: this.cache.size,
      expiredItems: expiredCount,
      activeItems: this.cache.size - expiredCount,
      averageAccessCount: this.cache.size > 0 ? totalAccessCount / this.cache.size : 0,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): number {
    // Estimativa simples do uso de memória
    let size = 0;
    for (const [key, item] of this.cache) {
      size += key.length * 2; // UTF-16
      size += JSON.stringify(item).length * 2;
    }
    return size;
  }

  destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
    }
    this.clear();
  }
}

// Instância global do cache
export const globalCache = new SmartCache({
  defaultTtl: 5 * 60 * 1000, // 5 minutos
  maxSize: 200,
  gcInterval: 2 * 60 * 1000 // 2 minutos
});

// Utilitários helper
export const cacheUtils = {
  // Cache para dados de usuário
  userCache: new SmartCache({
    defaultTtl: 10 * 60 * 1000, // 10 minutos
    maxSize: 50
  }),

  // Cache para soluções
  solutionsCache: new SmartCache({
    defaultTtl: 3 * 60 * 1000, // 3 minutos
    maxSize: 100
  }),

  // Cache para dados de onboarding
  onboardingCache: new SmartCache({
    defaultTtl: 1 * 60 * 1000, // 1 minuto
    maxSize: 30
  })
};
