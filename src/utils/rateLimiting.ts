
import { logger } from './logger';

interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  progressiveDelay?: boolean;
}

class RateLimiter {
  private attempts = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;
  
  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Limpeza automática a cada 5 minutos
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }
  
  // Verificar se o identificador pode fazer uma tentativa
  canAttempt(identifier: string): { allowed: boolean; waitTime?: number; reason?: string } {
    const now = Date.now();
    const entry = this.attempts.get(identifier);
    
    if (!entry) {
      // Primeira tentativa
      this.attempts.set(identifier, {
        attempts: 1,
        lastAttempt: now
      });
      return { allowed: true };
    }
    
    // Verificar se está bloqueado
    if (entry.blockedUntil && now < entry.blockedUntil) {
      const waitTime = Math.ceil((entry.blockedUntil - now) / 1000);
      logger.warn("Tentativa bloqueada por rate limiting", {
        identifier: identifier.substring(0, 10) + '***',
        waitTime,
        component: 'RATE_LIMITER'
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
      // Reset da janela
      this.attempts.set(identifier, {
        attempts: 1,
        lastAttempt: now
      });
      return { allowed: true };
    }
    
    // Incrementar tentativas
    entry.attempts++;
    entry.lastAttempt = now;
    
    // Verificar se excedeu o limite
    if (entry.attempts > this.config.maxAttempts) {
      let blockDuration = this.config.blockDurationMs;
      
      // Delay progressivo para tentativas repetidas
      if (this.config.progressiveDelay) {
        const multiplier = Math.min(entry.attempts - this.config.maxAttempts, 10);
        blockDuration *= multiplier;
      }
      
      entry.blockedUntil = now + blockDuration;
      
      logger.warn("Rate limit excedido, bloqueando temporariamente", {
        identifier: identifier.substring(0, 10) + '***',
        attempts: entry.attempts,
        blockDuration: blockDuration / 1000,
        component: 'RATE_LIMITER'
      });
      
      return { 
        allowed: false, 
        waitTime: Math.ceil(blockDuration / 1000),
        reason: `Muitas tentativas. Bloqueado por ${Math.ceil(blockDuration / 1000)} segundos`
      };
    }
    
    return { allowed: true };
  }
  
  // Resetar tentativas para um identificador (útil após sucesso)
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
  
  // Limpeza de entradas expiradas
  private cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];
    
    this.attempts.forEach((entry, identifier) => {
      // Remover entradas antigas (mais de 1 hora)
      if (now - entry.lastAttempt > 60 * 60 * 1000) {
        expired.push(identifier);
      }
      // Remover bloqueios expirados
      else if (entry.blockedUntil && now > entry.blockedUntil) {
        delete entry.blockedUntil;
      }
    });
    
    expired.forEach(identifier => {
      this.attempts.delete(identifier);
    });
    
    if (expired.length > 0) {
      logger.info("Limpeza de rate limiting concluída", {
        removedEntries: expired.length,
        component: 'RATE_LIMITER'
      });
    }
  }
  
  // Obter estatísticas do rate limiter
  getStats(): { totalEntries: number; blockedEntries: number } {
    const now = Date.now();
    let blockedEntries = 0;
    
    this.attempts.forEach(entry => {
      if (entry.blockedUntil && now < entry.blockedUntil) {
        blockedEntries++;
      }
    });
    
    return {
      totalEntries: this.attempts.size,
      blockedEntries
    };
  }
}

// Rate limiters pré-configurados para diferentes cenários
export const loginRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutos
  blockDurationMs: 30 * 60 * 1000, // 30 minutos
  progressiveDelay: true
});

export const apiRateLimiter = new RateLimiter({
  maxAttempts: 50,
  windowMs: 60 * 1000, // 1 minuto
  blockDurationMs: 60 * 1000, // 1 minuto
  progressiveDelay: false
});

export const passwordResetRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hora
  blockDurationMs: 2 * 60 * 60 * 1000, // 2 horas
  progressiveDelay: true
});

// Utilitários para identificadores seguros
export const createSecureIdentifier = (baseId: string, additionalData?: string): string => {
  // Criar identificador que combina IP simulado e dados adicionais
  const base = baseId.toLowerCase().trim();
  const additional = additionalData ? additionalData.toLowerCase().trim() : '';
  return `${base}_${additional}`.replace(/[^a-z0-9_]/g, '');
};

export const getClientIdentifier = (): string => {
  // Identificador baseado em características do cliente (sem dados pessoais)
  const userAgent = navigator.userAgent.substring(0, 50);
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Hash simples para criar identificador único mas não pessoal
  const identifier = `${userAgent}_${language}_${timezone}`;
  return btoa(identifier).substring(0, 16);
};
