
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/userProfile';

interface CachedAuthData {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  timestamp: number;
}

const CACHE_KEY = 'viver-ia-auth-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useAuthCache = () => {
  const [cachedData, setCachedData] = useState<CachedAuthData | null>(null);

  // Carregar cache do localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedAuthData = JSON.parse(cached);
        const isValid = Date.now() - parsed.timestamp < CACHE_DURATION;
        
        if (isValid && parsed.user) {
          setCachedData(parsed);
          console.log('[AUTH-CACHE] Cache válido encontrado');
        } else {
          localStorage.removeItem(CACHE_KEY);
          console.log('[AUTH-CACHE] Cache expirado, removido');
        }
      }
    } catch (error) {
      console.error('[AUTH-CACHE] Erro ao carregar cache:', error);
      localStorage.removeItem(CACHE_KEY);
    }
  }, []);

  // Salvar dados no cache
  const saveToCache = (user: User | null, session: Session | null, profile: UserProfile | null) => {
    if (!user) {
      localStorage.removeItem(CACHE_KEY);
      setCachedData(null);
      return;
    }

    const cacheData: CachedAuthData = {
      user,
      session,
      profile,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      setCachedData(cacheData);
      console.log('[AUTH-CACHE] Dados salvos no cache');
    } catch (error) {
      console.error('[AUTH-CACHE] Erro ao salvar cache:', error);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setCachedData(null);
  };

  return {
    cachedData,
    saveToCache,
    clearCache,
    hasValidCache: !!cachedData?.user
  };
};
