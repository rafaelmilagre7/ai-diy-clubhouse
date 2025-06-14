
import { Session, User } from '@supabase/supabase-js';
import { logger } from './logger';

interface CachedSessionData {
  session: Session;
  user: User;
  timestamp: number;
  isValid: boolean;
}

class SecureSessionCache {
  private cache = new Map<string, CachedSessionData>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutos

  set(key: string, data: CachedSessionData) {
    try {
      // SEGURANÇA: Validar dados antes de armazenar
      if (!data.session || !data.user) {
        logger.warn('[SECURE-CACHE] Tentativa de armazenar dados inválidos');
        return;
      }

      // SEGURANÇA: Verificar se o usuário da sessão corresponde ao usuário
      if (data.session.user.id !== data.user.id) {
        logger.error('[SECURE-CACHE] VIOLAÇÃO DE SEGURANÇA: IDs não correspondem');
        return;
      }

      this.cache.set(key, {
        ...data,
        timestamp: Date.now(),
        isValid: true
      });

      logger.info(`[SECURE-CACHE] Sessão armazenada com segurança para chave ${key}`);
    } catch (error) {
      logger.error('[SECURE-CACHE] Erro ao armazenar sessão:', error);
    }
  }

  get(key: string): CachedSessionData | null {
    try {
      const cached = this.cache.get(key);
      
      if (!cached) {
        return null;
      }

      // SEGURANÇA: Verificar TTL
      const isExpired = (Date.now() - cached.timestamp) > this.TTL;
      if (isExpired) {
        logger.info(`[SECURE-CACHE] Cache expirado para chave ${key}`);
        this.cache.delete(key);
        return null;
      }

      // SEGURANÇA: Validar integridade dos dados
      if (!cached.session || !cached.user || !cached.isValid) {
        logger.warn(`[SECURE-CACHE] Dados corrompidos detectados para chave ${key}`);
        this.cache.delete(key);
        return null;
      }

      logger.info(`[SECURE-CACHE] Cache hit seguro para chave ${key}`);
      return cached;
    } catch (error) {
      logger.error('[SECURE-CACHE] Erro ao recuperar sessão:', error);
      return null;
    }
  }

  clear() {
    try {
      const size = this.cache.size;
      this.cache.clear();
      logger.info(`[SECURE-CACHE] Cache limpo com segurança (${size} entradas removidas)`);
    } catch (error) {
      logger.error('[SECURE-CACHE] Erro ao limpar cache:', error);
    }
  }

  // SEGURANÇA: Limpeza automática de entradas expiradas
  cleanup() {
    try {
      const now = Date.now();
      let cleanedCount = 0;
      
      for (const [key, cached] of this.cache.entries()) {
        if ((now - cached.timestamp) > this.TTL) {
          this.cache.delete(key);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        logger.info(`[SECURE-CACHE] Limpeza automática: ${cleanedCount} entradas expiradas removidas`);
      }
    } catch (error) {
      logger.error('[SECURE-CACHE] Erro na limpeza automática:', error);
    }
  }

  // SEGURANÇA: Estatísticas para monitoramento
  getStats() {
    try {
      const now = Date.now();
      const entries = Array.from(this.cache.values());
      
      return {
        total: entries.length,
        valid: entries.filter(cached => cached.isValid).length,
        expired: entries.filter(cached => (now - cached.timestamp) > this.TTL).length,
        oldestEntry: entries.length > 0 ? Math.min(...entries.map(cached => cached.timestamp)) : null
      };
    } catch (error) {
      logger.error('[SECURE-CACHE] Erro ao obter estatísticas:', error);
      return { total: 0, valid: 0, expired: 0, oldestEntry: null };
    }
  }
}

// Instância singleton
export const secureSessionCache = new SecureSessionCache();

// OTIMIZAÇÃO: Limpeza automática a cada 2 minutos
setInterval(() => {
  secureSessionCache.cleanup();
}, 2 * 60 * 1000);
