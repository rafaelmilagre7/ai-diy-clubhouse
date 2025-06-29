
/**
 * Sistema de cache para otimizar navegação entre áreas autenticadas
 */

interface NavigationCache {
  adminVerified: boolean;
  formacaoVerified: boolean;
  userProfile: any;
  timestamp: number;
  userId: string;
}

const CACHE_KEY = 'viver_navigation_cache';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

export const navigationCache = {
  set: (userId: string, profile: any, area: 'admin' | 'formacao') => {
    try {
      const cache: NavigationCache = {
        adminVerified: area === 'admin',
        formacaoVerified: area === 'formacao', 
        userProfile: profile,
        timestamp: Date.now(),
        userId
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      console.log(`🚀 [NAV-CACHE] Cache definido para ${area}:`, { userId: userId.substring(0, 8) + '***' });
    } catch (error) {
      console.warn('[NAV-CACHE] Erro ao definir cache:', error);
    }
  },

  get: (userId: string): NavigationCache | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const cache: NavigationCache = JSON.parse(cached);
      
      // Verificar se o cache é válido
      if (
        cache.userId !== userId ||
        Date.now() - cache.timestamp > CACHE_DURATION
      ) {
        navigationCache.clear();
        return null;
      }
      
      console.log(`✅ [NAV-CACHE] Cache válido encontrado:`, { 
        userId: userId.substring(0, 8) + '***',
        adminVerified: cache.adminVerified,
        formacaoVerified: cache.formacaoVerified
      });
      
      return cache;
    } catch (error) {
      console.warn('[NAV-CACHE] Erro ao ler cache:', error);
      return null;
    }
  },

  clear: () => {
    try {
      sessionStorage.removeItem(CACHE_KEY);
      console.log('🧹 [NAV-CACHE] Cache limpo');
    } catch (error) {
      console.warn('[NAV-CACHE] Erro ao limpar cache:', error);
    }
  },

  isAdminVerified: (userId: string): boolean => {
    const cache = navigationCache.get(userId);
    return cache?.adminVerified || false;
  },

  isFormacaoVerified: (userId: string): boolean => {
    const cache = navigationCache.get(userId);
    return cache?.formacaoVerified || false;
  }
};
