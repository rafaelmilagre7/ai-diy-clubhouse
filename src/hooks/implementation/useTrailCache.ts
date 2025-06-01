
import { useState, useCallback, useEffect } from 'react';
import { ImplementationTrail } from '@/types/implementation-trail';

interface TrailCacheEntry {
  trail: ImplementationTrail;
  timestamp: number;
  profileHash: string;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
const CACHE_KEY = 'implementation_trail_cache';

export const useTrailCache = (userId: string, profileHash: string) => {
  const [cachedTrail, setCachedTrail] = useState<ImplementationTrail | null>(null);
  const [cacheTimestamp, setCacheTimestamp] = useState<number | null>(null);

  // Carregar cache do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${CACHE_KEY}_${userId}`);
      if (stored) {
        const entry: TrailCacheEntry = JSON.parse(stored);
        
        // Verificar se cache ainda é válido
        const now = Date.now();
        const isValid = now - entry.timestamp < CACHE_DURATION;
        const profileMatches = entry.profileHash === profileHash;
        
        if (isValid && profileMatches) {
          setCachedTrail(entry.trail);
          setCacheTimestamp(entry.timestamp);
          console.log('🎯 Cache de trilha carregado:', {
            age: Math.round((now - entry.timestamp) / (1000 * 60)),
            validFor: Math.round((CACHE_DURATION - (now - entry.timestamp)) / (1000 * 60))
          });
        } else {
          // Cache inválido, remover
          localStorage.removeItem(`${CACHE_KEY}_${userId}`);
          console.log('🗑️ Cache de trilha removido (inválido)');
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar cache de trilha:', error);
      localStorage.removeItem(`${CACHE_KEY}_${userId}`);
    }
  }, [userId, profileHash]);

  // Salvar trilha no cache
  const saveToCache = useCallback((trail: ImplementationTrail) => {
    try {
      const entry: TrailCacheEntry = {
        trail,
        timestamp: Date.now(),
        profileHash
      };
      
      localStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify(entry));
      setCachedTrail(trail);
      setCacheTimestamp(entry.timestamp);
      
      console.log('💾 Trilha salva no cache');
    } catch (error) {
      console.warn('⚠️ Erro ao salvar trilha no cache:', error);
    }
  }, [userId, profileHash]);

  // Invalidar cache
  const invalidateCache = useCallback(() => {
    localStorage.removeItem(`${CACHE_KEY}_${userId}`);
    setCachedTrail(null);
    setCacheTimestamp(null);
    console.log('🗑️ Cache de trilha invalidado');
  }, [userId]);

  // Verificar se cache é válido
  const isCacheValid = useCallback(() => {
    if (!cachedTrail || !cacheTimestamp) return false;
    
    const now = Date.now();
    return (now - cacheTimestamp) < CACHE_DURATION;
  }, [cachedTrail, cacheTimestamp]);

  return {
    cachedTrail,
    cacheTimestamp,
    saveToCache,
    invalidateCache,
    isCacheValid: isCacheValid()
  };
};
