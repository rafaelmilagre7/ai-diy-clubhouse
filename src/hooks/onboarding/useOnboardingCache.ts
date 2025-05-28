
import { useCallback, useRef, useEffect } from 'react';
import { OnboardingProgress } from '@/types/onboarding';

interface CacheEntry {
  data: OnboardingProgress;
  timestamp: number;
  version: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const CACHE_KEY = 'onboarding_cache';

export const useOnboardingCache = (userId?: string) => {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  // Carregar cache do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        cacheRef.current = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn('Erro ao carregar cache do onboarding:', error);
      localStorage.removeItem(CACHE_KEY);
    }
  }, []);

  // Salvar cache no localStorage
  const persistCache = useCallback(() => {
    try {
      const cacheObject = Object.fromEntries(cacheRef.current.entries());
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Erro ao persistir cache:', error);
    }
  }, []);

  // Obter dados do cache
  const getCachedData = useCallback((key: string): OnboardingProgress | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) return null;
    
    // Verificar se o cache expirou
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      cacheRef.current.delete(key);
      persistCache();
      return null;
    }
    
    return entry.data;
  }, [persistCache]);

  // Armazenar dados no cache
  const setCachedData = useCallback((key: string, data: OnboardingProgress) => {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    cacheRef.current.set(key, entry);
    persistCache();
  }, [persistCache]);

  // Invalidar cache específico
  const invalidateCache = useCallback((key: string) => {
    cacheRef.current.delete(key);
    persistCache();
  }, [persistCache]);

  // Limpar todo o cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    localStorage.removeItem(CACHE_KEY);
  }, []);

  // Obter chave de cache para usuário
  const getUserCacheKey = useCallback((uid: string) => `user_${uid}`, []);

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    clearCache,
    getUserCacheKey,
    // Métodos específicos para onboarding
    getCachedProgress: useCallback((uid: string) => 
      getCachedData(getUserCacheKey(uid)), [getCachedData, getUserCacheKey]
    ),
    setCachedProgress: useCallback((uid: string, data: OnboardingProgress) => 
      setCachedData(getUserCacheKey(uid), data), [setCachedData, getUserCacheKey]
    ),
    invalidateUserCache: useCallback((uid: string) => 
      invalidateCache(getUserCacheKey(uid)), [invalidateCache, getUserCacheKey]
    )
  };
};
