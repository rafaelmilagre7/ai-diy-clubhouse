
import { logger } from './logger';

interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
  suspiciousActivity: boolean;
}

interface RateLimitStats {
  totalEntries: number;
  blockedEntries: number;
  suspiciousIPs: number;
}

class SecureRateLimiter {
  private attempts = new Map<string, RateLimitEntry>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000, blockDurationMs = 30 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;

    // Limpeza automática a cada 10 minutos
    setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  // Criar identificador seguro (hash simples do IP + contexto)
  private createIdentifier(input: string, context: string): string {
    // Em um ambiente real, isso seria um hash mais robusto
    const combined = input + context + Date.now().toString().slice(0, -3); // Remove últimos 3 dígitos para agrupar por período
    return btoa(combined).substring(0, 16);
  }

  // Verificar se pode fazer tentativa
  async canAttempt(identifier: string, context: string): Promise<{
    allowed: boolean;
    remaining?: number;
    waitTime?: number;
    reason?: string;
  }> {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    // Se não há entrada, permitir
    if (!entry) {
      this.attempts.set(identifier, {
        attempts: 1,
        lastAttempt: now,
        suspiciousActivity: false
      });
      return { allowed: true, remaining: this.maxAttempts - 1 };
    }

    // Se está bloqueado, verificar se o bloqueio expirou
    if (entry.blockedUntil && now < entry.blockedUntil) {
      const waitTime = Math.ceil((entry.blockedUntil - now) / 1000);
      return {
        allowed: false,
        waitTime,
        reason: `Bloqueado por mais ${waitTime} segundos`
      };
    }

    // Se a janela de tempo expirou, resetar contadores
    if (now - entry.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, {
        attempts: 1,
        lastAttempt: now,
        suspiciousActivity: false
      });
      return { allowed: true, remaining: this.maxAttempts - 1 };
    }

    // Verificar se excedeu o limite
    if (entry.attempts >= this.maxAttempts) {
      // Bloquear por período determinado
      entry.blockedUntil = now + this.blockDurationMs;
      entry.suspiciousActivity = true;

      logger.warn('Rate limit excedido - bloqueando identificador', {
        component: 'SECURE_RATE_LIMITER',
        context,
        attempts: entry.attempts,
        identifier: identifier.substring(0, 8) + '***'
      });

      const waitTime = Math.ceil(this.blockDurationMs / 1000);
      return {
        allowed: false,
        waitTime,
        reason: `Muitas tentativas. Bloqueado por ${Math.ceil(waitTime / 60)} minutos`
      };
    }

    // Incrementar tentativas
    entry.attempts++;
    entry.lastAttempt = now;

    const remaining = this.maxAttempts - entry.attempts;
    
    // Avisar quando restam poucas tentativas
    if (remaining <= 2) {
      logger.warn('Poucas tentativas restantes', {
        component: 'SECURE_RATE_LIMITER',
        context,
        remaining,
        identifier: identifier.substring(0, 8) + '***'
      });
    }

    return { allowed: true, remaining };
  }

  // Reportar sucesso (limpar contadores)
  reportSuccess(identifier: string): void {
    this.attempts.delete(identifier);
  }

  // Obter estatísticas
  getStats(): RateLimitStats {
    const now = Date.now();
    let totalEntries = 0;
    let blockedEntries = 0;
    let suspiciousIPs = 0;

    for (const [identifier, entry] of this.attempts.entries()) {
      totalEntries++;
      
      if (entry.blockedUntil && now < entry.blockedUntil) {
        blockedEntries++;
      }
      
      if (entry.suspiciousActivity) {
        suspiciousIPs++;
      }
    }

    return { totalEntries, blockedEntries, suspiciousIPs };
  }

  // Limpeza de entradas antigas
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [identifier, entry] of this.attempts.entries()) {
      // Remover entradas antigas que não estão mais bloqueadas
      if ((!entry.blockedUntil || now > entry.blockedUntil) && 
          (now - entry.lastAttempt) > this.windowMs * 2) {
        this.attempts.delete(identifier);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('Limpeza de rate limiting completada', {
        component: 'SECURE_RATE_LIMITER',
        entriesRemoved: cleaned,
        remainingEntries: this.attempts.size
      });
    }
  }
}

// Instâncias específicas para diferentes contextos
export const loginRateLimiter = new SecureRateLimiter(5, 15 * 60 * 1000, 30 * 60 * 1000); // 5 tentativas por 15 min, bloquear por 30 min
export const apiRateLimiter = new SecureRateLimiter(20, 60 * 1000, 5 * 60 * 1000); // 20 tentativas por minuto, bloquear por 5 min

// Função para criar identificador seguro
export const createSecureIdentifier = (input: string, context: string): string => {
  // Implementação simplificada - em produção usar hash mais robusto
  const sanitized = input.toLowerCase().trim();
  return btoa(sanitized + context + Date.now().toString().slice(0, -3)).substring(0, 16);
};
