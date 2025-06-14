
import { Session } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

interface SecureSessionEntry {
  session: Session;
  timestamp: number;
  checksum: string;
  tabId: string;
  validated: boolean;
}

interface SessionMutex {
  locked: boolean;
  queue: Array<() => void>;
}

class SecureSessionCache {
  private cache = new Map<string, SecureSessionEntry>();
  private readonly TTL = 15 * 60 * 1000; // 15 minutos - reduzido para maior segurança
  private readonly tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  private mutexes = new Map<string, SessionMutex>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Limpeza automática mais frequente para segurança
    this.cleanupInterval = setInterval(() => {
      this.cleanExpiredAndInvalid();
    }, 2 * 60 * 1000); // A cada 2 minutos
  }

  // SEGURANÇA: Gerar checksum para validar integridade
  private generateChecksum(session: Session): string {
    const data = `${session.access_token.substring(0, 20)}${session.user.id}${session.expires_at}`;
    return btoa(data).substring(0, 16);
  }

  // SEGURANÇA: Validar token JWT sem decodificar completamente
  private validateJWTBasic(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Verificar se é um JWT válido (estrutura básica)
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      // Verificar campos obrigatórios
      if (!header.alg || !payload.sub || !payload.exp) return false;
      
      // Verificar expiração
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now + 60) { // 60 segundos de margem
        logger.warn('[SECURE-CACHE] Token próximo da expiração');
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  // SEGURANÇA: Implementar mutex para prevenir race conditions
  private async withMutex<T>(key: string, operation: () => Promise<T>): Promise<T> {
    if (!this.mutexes.has(key)) {
      this.mutexes.set(key, { locked: false, queue: [] });
    }
    
    const mutex = this.mutexes.get(key)!;
    
    if (mutex.locked) {
      return new Promise((resolve, reject) => {
        mutex.queue.push(async () => {
          try {
            const result = await operation();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    }
    
    mutex.locked = true;
    
    try {
      const result = await operation();
      return result;
    } finally {
      mutex.locked = false;
      const next = mutex.queue.shift();
      if (next) {
        setTimeout(next, 0);
      }
    }
  }

  // SEGURANÇA: Armazenar sessão com validações rigorosas
  async setSecureSession(userId: string, session: Session): Promise<boolean> {
    return this.withMutex(`set_${userId}`, async () => {
      try {
        // Validar token antes de armazenar
        if (!this.validateJWTBasic(session.access_token)) {
          logger.error('[SECURE-CACHE] Token JWT inválido, rejeitando cache');
          return false;
        }

        // Detectar tentativa de cache de sessão duplicada/conflitante
        const existing = this.cache.get(userId);
        if (existing && existing.tabId !== this.tabId && existing.session.access_token !== session.access_token) {
          logger.warn('[SECURE-CACHE] Detectada sessão conflitante - possível ataque');
          
          // Limpar cache suspeito
          this.cache.delete(userId);
          
          // Log de segurança
          this.logSecurityEvent('conflicting_session_detected', {
            userId: userId.substring(0, 8) + '***',
            currentTabId: this.tabId,
            existingTabId: existing.tabId
          });
        }

        const checksum = this.generateChecksum(session);
        const entry: SecureSessionEntry = {
          session,
          timestamp: Date.now(),
          checksum,
          tabId: this.tabId,
          validated: true
        };

        this.cache.set(userId, entry);
        
        logger.info('[SECURE-CACHE] Sessão armazenada com segurança', {
          userId: userId.substring(0, 8) + '***',
          tabId: this.tabId,
          checksum: checksum.substring(0, 8) + '***'
        });
        
        return true;
      } catch (error) {
        logger.error('[SECURE-CACHE] Erro ao armazenar sessão:', error);
        return false;
      }
    });
  }

  // SEGURANÇA: Recuperar sessão com validações rigorosas
  async getSecureSession(userId: string): Promise<Session | null> {
    return this.withMutex(`get_${userId}`, async () => {
      try {
        const entry = this.cache.get(userId);
        
        if (!entry) return null;

        const now = Date.now();
        
        // Verificar TTL
        if (now - entry.timestamp > this.TTL) {
          logger.info('[SECURE-CACHE] Cache expirado por TTL');
          this.cache.delete(userId);
          return null;
        }

        // SEGURANÇA: Validar integridade
        const currentChecksum = this.generateChecksum(entry.session);
        if (currentChecksum !== entry.checksum) {
          logger.error('[SECURE-CACHE] VIOLAÇÃO DE INTEGRIDADE detectada!');
          this.cache.delete(userId);
          
          this.logSecurityEvent('cache_integrity_violation', {
            userId: userId.substring(0, 8) + '***',
            expectedChecksum: entry.checksum,
            actualChecksum: currentChecksum
          });
          
          return null;
        }

        // SEGURANÇA: Re-validar JWT
        if (!this.validateJWTBasic(entry.session.access_token)) {
          logger.warn('[SECURE-CACHE] Token inválido no cache, removendo');
          this.cache.delete(userId);
          return null;
        }

        // SEGURANÇA: Verificar se é da mesma aba (opcional, para debug)
        if (entry.tabId !== this.tabId) {
          logger.debug('[SECURE-CACHE] Sessão de aba diferente detectada', {
            currentTab: this.tabId,
            cachedTab: entry.tabId
          });
        }

        logger.info('[SECURE-CACHE] Cache hit seguro', {
          userId: userId.substring(0, 8) + '***',
          cacheAge: `${Math.floor((now - entry.timestamp) / 1000)}s`
        });

        return entry.session;
      } catch (error) {
        logger.error('[SECURE-CACHE] Erro ao recuperar sessão:', error);
        return null;
      }
    });
  }

  // SEGURANÇA: Limpar cache específico
  async clearUserSession(userId: string): Promise<void> {
    return this.withMutex(`clear_${userId}`, async () => {
      this.cache.delete(userId);
      logger.info('[SECURE-CACHE] Cache limpo para usuário', {
        userId: userId.substring(0, 8) + '***'
      });
    });
  }

  // SEGURANÇA: Limpar todo o cache
  clearAllSessions(): void {
    const count = this.cache.size;
    this.cache.clear();
    logger.info(`[SECURE-CACHE] ${count} sessões removidas do cache`);
  }

  // SEGURANÇA: Limpeza automática de entradas expiradas/inválidas
  private cleanExpiredAndInvalid(): void {
    const now = Date.now();
    let cleanedCount = 0;
    let invalidCount = 0;

    for (const [userId, entry] of this.cache.entries()) {
      let shouldRemove = false;
      
      // Verificar TTL
      if (now - entry.timestamp > this.TTL) {
        shouldRemove = true;
        cleanedCount++;
      }
      
      // Verificar integridade
      else if (this.generateChecksum(entry.session) !== entry.checksum) {
        shouldRemove = true;
        invalidCount++;
        logger.warn('[SECURE-CACHE] Removendo cache com integridade comprometida');
      }
      
      // Verificar JWT básico
      else if (!this.validateJWTBasic(entry.session.access_token)) {
        shouldRemove = true;
        invalidCount++;
      }
      
      if (shouldRemove) {
        this.cache.delete(userId);
      }
    }

    if (cleanedCount > 0 || invalidCount > 0) {
      logger.info(`[SECURE-CACHE] Limpeza: ${cleanedCount} expiradas, ${invalidCount} inválidas`);
    }
  }

  // SEGURANÇA: Log de eventos de segurança
  private logSecurityEvent(event: string, details: Record<string, any>): void {
    logger.warn(`[SECURITY-EVENT] ${event}`, {
      event,
      timestamp: new Date().toISOString(),
      tabId: this.tabId,
      ...details
    });
  }

  // Estatísticas para debugging
  getStats() {
    return {
      totalSessions: this.cache.size,
      tabId: this.tabId,
      mutexCount: this.mutexes.size,
      oldestCache: this.cache.size > 0 ? 
        Math.min(...Array.from(this.cache.values()).map(e => e.timestamp)) : null
    };
  }

  // Cleanup ao destruir
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clearAllSessions();
  }
}

export const secureSessionCache = new SecureSessionCache();

// Cleanup automático ao descarregar página
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    secureSessionCache.destroy();
  });
}
