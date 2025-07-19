
import { UserProfile } from '@/lib/supabase';

interface CacheEntry {
  profile: UserProfile;
  timestamp: number;
  version: string;
}

interface AuthCacheConfig {
  ttl: number; // 30 minutos
  key: string;
  version: string;
}

const CACHE_CONFIG: AuthCacheConfig = {
  ttl: 30 * 60 * 1000, // 30 minutos
  key: 'viverdeia_auth_profile',
  version: '1.0'
};

export class AuthCache {
  private static instance: AuthCache;
  
  static getInstance(): AuthCache {
    if (!AuthCache.instance) {
      AuthCache.instance = new AuthCache();
    }
    return AuthCache.instance;
  }

  get(userId: string): UserProfile | null {
    try {
      const cacheKey = `${CACHE_CONFIG.key}_${userId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const entry: CacheEntry = JSON.parse(cached);
      
      // Verificar versão e TTL
      if (entry.version !== CACHE_CONFIG.version || 
          Date.now() - entry.timestamp > CACHE_CONFIG.ttl) {
        this.remove(userId);
        return null;
      }
      
      return entry.profile;
    } catch (error) {
      console.warn('[AUTH-CACHE] Erro ao ler cache:', error);
      return null;
    }
  }

  set(userId: string, profile: UserProfile): void {
    try {
      const cacheKey = `${CACHE_CONFIG.key}_${userId}`;
      const entry: CacheEntry = {
        profile,
        timestamp: Date.now(),
        version: CACHE_CONFIG.version
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
      console.warn('[AUTH-CACHE] Erro ao salvar cache:', error);
    }
  }

  remove(userId: string): void {
    try {
      const cacheKey = `${CACHE_CONFIG.key}_${userId}`;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('[AUTH-CACHE] Erro ao remover cache:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_CONFIG.key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('[AUTH-CACHE] Erro ao limpar cache:', error);
    }
  }
}

export const authCache = AuthCache.getInstance();
