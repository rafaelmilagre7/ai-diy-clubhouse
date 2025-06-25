
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';

interface CachedProfile {
  profile: UserProfile;
  timestamp: number;
  ttl: number;
}

class ProfileCache {
  private cache = new Map<string, CachedProfile>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  set(userId: string, profile: UserProfile, ttl: number = this.DEFAULT_TTL): void {
    const cached: CachedProfile = {
      profile,
      timestamp: Date.now(),
      ttl
    };
    
    this.cache.set(userId, cached);
    logger.info('[PROFILE-CACHE] Profile armazenado no cache', { 
      userId, 
      ttl: `${ttl/1000}s`,
      cacheSize: this.cache.size 
    });
  }

  get(userId: string): UserProfile | null {
    const cached = this.cache.get(userId);
    
    if (!cached) {
      logger.info('[PROFILE-CACHE] Profile não encontrado no cache', { userId });
      return null;
    }

    const now = Date.now();
    const isExpired = (now - cached.timestamp) > cached.ttl;
    
    if (isExpired) {
      this.cache.delete(userId);
      logger.info('[PROFILE-CACHE] Profile expirado removido do cache', { 
        userId, 
        age: `${Math.round((now - cached.timestamp)/1000)}s`
      });
      return null;
    }

    const remainingTtl = cached.ttl - (now - cached.timestamp);
    logger.info('[PROFILE-CACHE] Profile encontrado no cache', { 
      userId, 
      remainingTtl: `${Math.round(remainingTtl/1000)}s`
    });
    
    return cached.profile;
  }

  delete(userId: string): void {
    const removed = this.cache.delete(userId);
    if (removed) {
      logger.info('[PROFILE-CACHE] Profile removido do cache', { userId });
    }
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info('[PROFILE-CACHE] Cache limpo completamente', { removedProfiles: size });
  }

  getStats(): { size: number; entries: Array<{ userId: string; age: number; ttl: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([userId, cached]) => ({
      userId,
      age: Math.round((now - cached.timestamp) / 1000),
      ttl: Math.round(cached.ttl / 1000)
    }));

    return {
      size: this.cache.size,
      entries
    };
  }

  // Limpeza automática de profiles expirados
  cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [userId, cached] of this.cache.entries()) {
      if ((now - cached.timestamp) > cached.ttl) {
        this.cache.delete(userId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.info('[PROFILE-CACHE] Limpeza automática concluída', { 
        removedProfiles: removedCount,
        remainingProfiles: this.cache.size 
      });
    }
  }
}

export const profileCache = new ProfileCache();

// Limpeza automática a cada 10 minutos
setInterval(() => {
  profileCache.cleanup();
}, 10 * 60 * 1000);
