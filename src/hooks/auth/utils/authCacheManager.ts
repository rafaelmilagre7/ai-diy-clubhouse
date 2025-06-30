
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';

// Cache manager melhorado para perfis de usuário
class AuthCacheManager {
  private cache = new Map<string, { profile: UserProfile | null; timestamp: number; version: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private version = 0;

  // Obter perfil do cache se válido
  get(userId: string): UserProfile | null | undefined {
    const cached = this.cache.get(userId);
    if (!cached) return undefined;
    
    const isExpired = (Date.now() - cached.timestamp) > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(userId);
      return undefined;
    }
    
    logger.debug('[AUTH-CACHE] Cache hit para usuário', { userId: userId.substring(0, 8) + '***' });
    return cached.profile;
  }

  // Salvar perfil no cache
  set(userId: string, profile: UserProfile | null): void {
    this.version++;
    this.cache.set(userId, {
      profile,
      timestamp: Date.now(),
      version: this.version
    });
    logger.debug('[AUTH-CACHE] Cache atualizado para usuário', { userId: userId.substring(0, 8) + '***' });
  }

  // Invalidar cache específico
  invalidate(userId: string): void {
    this.cache.delete(userId);
    logger.debug('[AUTH-CACHE] Cache invalidado para usuário', { userId: userId.substring(0, 8) + '***' });
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear();
    this.version = 0;
    logger.info('[AUTH-CACHE] Cache limpo completamente');
  }

  // Verificar se cache está fresco
  isFresh(userId: string): boolean {
    const cached = this.cache.get(userId);
    if (!cached) return false;
    return (Date.now() - cached.timestamp) < this.CACHE_DURATION;
  }

  // Estatísticas do cache
  getStats() {
    return {
      size: this.cache.size,
      version: this.version,
      entries: Array.from(this.cache.keys()).map(key => ({
        userId: key.substring(0, 8) + '***',
        age: Date.now() - (this.cache.get(key)?.timestamp || 0)
      }))
    };
  }
}

// Instância singleton
export const authCacheManager = new AuthCacheManager();

// Debounce utility para evitar chamadas múltiplas
export class DebounceManager {
  private timers = new Map<string, NodeJS.Timeout>();
  private executing = new Set<string>();

  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    delay: number = 500
  ): Promise<T | null> {
    // Se já está executando, aguardar
    if (this.executing.has(key)) {
      logger.debug('[DEBOUNCE] Operação já em execução, ignorando', { key });
      return null;
    }

    // Limpar timer anterior se existir
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        try {
          this.executing.add(key);
          logger.debug('[DEBOUNCE] Executando operação', { key });
          const result = await fn();
          resolve(result);
        } catch (error) {
          logger.error('[DEBOUNCE] Erro na operação', { key, error });
          resolve(null);
        } finally {
          this.executing.delete(key);
          this.timers.delete(key);
        }
      }, delay);

      this.timers.set(key, timer);
    });
  }

  // Limpar todos os timers
  clear(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.executing.clear();
  }

  // Verificar se operação está pendente
  isPending(key: string): boolean {
    return this.timers.has(key);
  }

  // Verificar se operação está executando
  isExecuting(key: string): boolean {
    return this.executing.has(key);
  }
}

export const debounceManager = new DebounceManager();
