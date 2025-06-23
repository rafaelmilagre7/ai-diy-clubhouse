
import { logger } from './logger';
import { auditLogger } from './auditLogger';

interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
  failures: number;
}

interface SecureRateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  progressiveDelay?: boolean;
  maxFailures?: number;
  failureMultiplier?: number;
}

class SecureRateLimiter {
  private attempts = new Map<string, RateLimitEntry>();
  private config: SecureRateLimitConfig;
  private suspiciousIPs = new Set<string>();
  
  constructor(config: SecureRateLimitConfig) {
    this.config = {
      maxFailures: 10,
      failureMultiplier: 2,
      ...config
    };
    
    // Limpeza automática a cada 10 minutos
    setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }
  
  // Verificar se pode fazer tentativa
  async canAttempt(identifier: string, context?: string): Promise<{ 
    allowed: boolean; 
    waitTime?: number; 
    reason?: string;
    remaining?: number;
  }> {
    const now = Date.now();
    const entry = this.attempts.get(identifier);
    
    // Log da tentativa para auditoria
    await this.logAttempt(identifier, context);
    
    if (!entry) {
      // Primeira tentativa
      this.attempts.set(identifier, {
        attempts: 1,
        lastAttempt: now,
        failures: 0
      });
      return { 
        allowed: true, 
        remaining: this.config.maxAttempts - 1 
      };
    }
    
    // Verificar se está bloqueado
    if (entry.blockedUntil && now < entry.blockedUntil) {
      const waitTime = Math.ceil((entry.blockedUntil - now) / 1000);
      
      await auditLogger.logSecurityEvent('rate_limit_blocked', 'medium', {
        identifier: this.hashIdentifier(identifier),
        waitTime,
        context,
        attempts: entry.attempts,
        failures: entry.failures
      });
      
      return { 
        allowed: false, 
        waitTime,
        reason: `Bloqueado por ${waitTime} segundos devido a muitas tentativas`
      };
    }
    
    // Verificar janela de tempo
    const windowStart = now - this.config.windowMs;
    if (entry.lastAttempt < windowStart) {
      // Reset da janela, mas manter histórico de falhas
      this.attempts.set(identifier, {
        attempts: 1,
        lastAttempt: now,
        failures: entry.failures
      });
      return { 
        allowed: true, 
        remaining: this.config.maxAttempts - 1 
      };
    }
    
    // Incrementar tentativas
    entry.attempts++;
    entry.lastAttempt = now;
    
    // Verificar se excedeu o limite
    if (entry.attempts > this.config.maxAttempts) {
      await this.blockIdentifier(identifier, entry, context);
      
      const waitTime = Math.ceil((entry.blockedUntil! - now) / 1000);
      return { 
        allowed: false, 
        waitTime,
        reason: `Limite excedido. Bloqueado por ${waitTime} segundos`
      };
    }
    
    const remaining = this.config.maxAttempts - entry.attempts;
    return { 
      allowed: true, 
      remaining: Math.max(0, remaining)
    };
  }
  
  // Bloquear identificador com lógica progressiva
  private async blockIdentifier(identifier: string, entry: RateLimitEntry, context?: string): Promise<void> {
    let blockDuration = this.config.blockDurationMs;
    
    // Aplicar delay progressivo baseado em falhas anteriores
    if (this.config.progressiveDelay && entry.failures > 0) {
      const multiplier = Math.min(
        Math.pow(this.config.failureMultiplier!, entry.failures), 
        20 // Máximo 20x
      );
      blockDuration *= multiplier;
    }
    
    entry.blockedUntil = Date.now() + blockDuration;
    entry.failures++;
    
    // Marcar como suspeito se muitas falhas
    if (entry.failures >= this.config.maxFailures!) {
      this.suspiciousIPs.add(identifier);
      
      await auditLogger.logSecurityEvent('suspicious_activity_detected', 'high', {
        identifier: this.hashIdentifier(identifier),
        failures: entry.failures,
        context,
        blockDuration: blockDuration / 1000
      });
    }
    
    logger.warn("Rate limit aplicado", {
      component: 'SECURE_RATE_LIMITER',
      identifier: this.hashIdentifier(identifier),
      attempts: entry.attempts,
      failures: entry.failures,
      blockDuration: blockDuration / 1000,
      context
    });
  }
  
  // Log de tentativa para auditoria
  private async logAttempt(identifier: string, context?: string): Promise<void> {
    try {
      await auditLogger.logAccessEvent('rate_limit_check', 'rate_limiter', {
        identifier: this.hashIdentifier(identifier),
        context,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Falhar silenciosamente para não afetar o rate limiting
    }
  }
  
  // Hash do identificador para logs
  private hashIdentifier(identifier: string): string {
    return identifier.substring(0, 8) + '***';
  }
  
  // Reportar sucesso (reseta failures em alguns casos)
  reportSuccess(identifier: string): void {
    const entry = this.attempts.get(identifier);
    if (entry && entry.failures > 0) {
      // Reduzir failures em caso de sucesso
      entry.failures = Math.max(0, entry.failures - 1);
      
      logger.info("Sucesso registrado, reduzindo penalty", {
        component: 'SECURE_RATE_LIMITER',
        identifier: this.hashIdentifier(identifier),
        remainingFailures: entry.failures
      });
    }
  }
  
  // Resetar completamente um identificador
  reset(identifier: string): void {
    this.attempts.delete(identifier);
    this.suspiciousIPs.delete(identifier);
    
    logger.info("Rate limit resetado", {
      component: 'SECURE_RATE_LIMITER',
      identifier: this.hashIdentifier(identifier)
    });
  }
  
  // Verificar se é suspeito
  isSuspicious(identifier: string): boolean {
    return this.suspiciousIPs.has(identifier);
  }
  
  // Limpeza de entradas expiradas
  private cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    this.attempts.forEach((entry, identifier) => {
      // Remover entradas muito antigas
      if (now - entry.lastAttempt > maxAge) {
        expired.push(identifier);
      }
      // Remover bloqueios expirados
      else if (entry.blockedUntil && now > entry.blockedUntil) {
        delete entry.blockedUntil;
      }
    });
    
    expired.forEach(identifier => {
      this.attempts.delete(identifier);
      this.suspiciousIPs.delete(identifier);
    });
    
    if (expired.length > 0) {
      logger.info("Limpeza de rate limiting concluída", {
        component: 'SECURE_RATE_LIMITER',
        removedEntries: expired.length,
        activeEntries: this.attempts.size,
        suspiciousIPs: this.suspiciousIPs.size
      });
    }
  }
  
  // Obter estatísticas
  getStats(): {
    totalEntries: number;
    blockedEntries: number;
    suspiciousIPs: number;
    activeBlocks: Array<{ identifier: string; remaining: number }>;
  } {
    const now = Date.now();
    let blockedEntries = 0;
    const activeBlocks: Array<{ identifier: string; remaining: number }> = [];
    
    this.attempts.forEach((entry, identifier) => {
      if (entry.blockedUntil && now < entry.blockedUntil) {
        blockedEntries++;
        activeBlocks.push({
          identifier: this.hashIdentifier(identifier),
          remaining: Math.ceil((entry.blockedUntil - now) / 1000)
        });
      }
    });
    
    return {
      totalEntries: this.attempts.size,
      blockedEntries,
      suspiciousIPs: this.suspiciousIPs.size,
      activeBlocks
    };
  }
}

// Rate limiters seguros pré-configurados
export const loginRateLimiter = new SecureRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutos
  blockDurationMs: 30 * 60 * 1000, // 30 minutos
  progressiveDelay: true,
  maxFailures: 3,
  failureMultiplier: 2
});

export const apiRateLimiter = new SecureRateLimiter({
  maxAttempts: 100,
  windowMs: 60 * 1000, // 1 minuto
  blockDurationMs: 5 * 60 * 1000, // 5 minutos
  progressiveDelay: false,
  maxFailures: 5,
  failureMultiplier: 1.5
});

export const passwordResetRateLimiter = new SecureRateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hora
  blockDurationMs: 2 * 60 * 60 * 1000, // 2 horas
  progressiveDelay: true,
  maxFailures: 2,
  failureMultiplier: 3
});

// Utilitário para criar identificadores seguros
export const createSecureIdentifier = (
  baseId: string, 
  additionalData?: string,
  includeFingerprint: boolean = true
): string => {
  const base = baseId.toLowerCase().trim();
  const additional = additionalData ? additionalData.toLowerCase().trim() : '';
  
  // Adicionar fingerprint do dispositivo se solicitado
  let fingerprint = '';
  if (includeFingerprint) {
    fingerprint = [
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset()
    ].join('_');
  }
  
  return `${base}_${additional}_${fingerprint}`.replace(/[^a-z0-9_]/g, '');
};
