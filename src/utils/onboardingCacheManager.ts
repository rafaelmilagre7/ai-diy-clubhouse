
import { logger } from '@/utils/logger';

/**
 * Gerenciador de cache para onboarding
 * Limpa dados inconsistentes que podem causar problemas
 */
export class OnboardingCacheManager {
  private static readonly CACHE_KEYS = [
    'viver-ia-onboarding-data',
    'onboarding-progress',
    'invite-token',
    'onboarding-step',
    'user-onboarding-state'
  ];

  /**
   * Limpa todo o cache relacionado ao onboarding
   */
  static clearAll(): void {
    try {
      logger.info('[ONBOARDING-CACHE] Limpando todo o cache de onboarding');
      
      this.CACHE_KEYS.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Limpar outros possíveis caches
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.includes('onboarding') || key.includes('invite')) {
          localStorage.removeItem(key);
        }
      });

      logger.info('[ONBOARDING-CACHE] Cache limpo com sucesso');
    } catch (error) {
      logger.error('[ONBOARDING-CACHE] Erro ao limpar cache:', error);
    }
  }

  /**
   * Limpa apenas dados específicos do usuário
   */
  static clearUserData(userId: string): void {
    try {
      logger.info('[ONBOARDING-CACHE] Limpando dados específicos do usuário');
      
      const userKeys = [
        `onboarding-${userId}`,
        `user-profile-${userId}`,
        `onboarding-progress-${userId}`
      ];

      userKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      logger.info('[ONBOARDING-CACHE] Dados do usuário limpos');
    } catch (error) {
      logger.error('[ONBOARDING-CACHE] Erro ao limpar dados do usuário:', error);
    }
  }

  /**
   * Força refresh dos dados de autenticação
   */
  static async forceAuthRefresh(): Promise<void> {
    try {
      logger.info('[ONBOARDING-CACHE] Forçando refresh da autenticação');
      
      // Limpar tokens em memória se possível
      const { supabase } = await import('@/lib/supabase');
      await supabase.auth.refreshSession();
      
      logger.info('[ONBOARDING-CACHE] Autenticação refreshed');
    } catch (error) {
      logger.error('[ONBOARDING-CACHE] Erro ao refresh auth:', error);
    }
  }

  /**
   * Diagnóstico completo do cache
   */
  static diagnose(): Record<string, any> {
    const diagnosis: Record<string, any> = {
      localStorage: {},
      sessionStorage: {},
      cacheKeys: this.CACHE_KEYS
    };

    try {
      // Verificar localStorage
      this.CACHE_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        diagnosis.localStorage[key] = value ? 'EXISTS' : 'EMPTY';
      });

      // Verificar sessionStorage
      this.CACHE_KEYS.forEach(key => {
        const value = sessionStorage.getItem(key);
        diagnosis.sessionStorage[key] = value ? 'EXISTS' : 'EMPTY';
      });

      // Contar todos os itens relacionados
      const allLocalKeys = Object.keys(localStorage);
      diagnosis.relatedKeys = allLocalKeys.filter(key => 
        key.includes('onboarding') || key.includes('invite') || key.includes('auth')
      );

      logger.info('[ONBOARDING-CACHE] Diagnóstico:', diagnosis);
    } catch (error) {
      logger.error('[ONBOARDING-CACHE] Erro no diagnóstico:', error);
      diagnosis.error = error;
    }

    return diagnosis;
  }
}
