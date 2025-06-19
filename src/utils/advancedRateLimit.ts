
import { logger } from './logger';
import { securityMonitor } from './securityMonitor';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
  progressiveMultiplier?: number;
  enableProgressiveDelay?: boolean;
}

interface RateLimitEntry {
  count: number;
  firstHit: number;
  lastHit: number;
  blockedUntil?: number;
  violations: number;
}

interface ThreatLevel {
  level: 'low' | 'medium' | 'high' | 'critical';
  multiplier: number;
  blockDuration: number;
}

class AdvancedRateLimit {
  private requests = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;
  private threatLevels: Map<string, ThreatLevel> = new Map();

  constructor(config: RateLimitConfig) {
    this.config = {
      progressiveMultiplier: 2,
      enableProgressiveDelay: true,
      ...config
    };

    // Limpeza automática
    setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // A cada minuto
  }

  // Verificar se pode fazer requisição
  checkLimit(identifier: string, action: string = 'general'): {
    allowed: boolean;
    remaining: number;
    resetTime?: number;
    blockDuration?: number;
    threatLevel?: string;
  } {
    const now = Date.now();
    const key = `${identifier}:${action}`;
    
    // Verificar se está bloqueado
    const entry = this.requests.get(key);
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      const blockDuration = Math.ceil((entry.blockedUntil - now) / 1000);
      
      // Monitorar tentativa durante bloqueio
      securityMonitor.monitorRateLimit(identifier, action, {
        status: 'blocked',
        blockDuration,
        violations: entry.violations
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        blockDuration,
        threatLevel: this.getThreatLevel(identifier).level
      };
    }

    // Verificar janela de tempo
    const windowStart = now - this.config.windowMs;
    
    if (!entry || entry.firstHit < windowStart) {
      // Nova janela ou primeira requisição
      this.requests.set(key, {
        count: 1,
        firstHit: now,
        lastHit: now,
        violations: entry?.violations || 0
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }

    // Incrementar contador
    entry.count++;
    entry.lastHit = now;

    const remaining = Math.max(0, this.config.maxRequests - entry.count);

    // Verificar se excedeu o limite
    if (entry.count > this.config.maxRequests) {
      entry.violations++;
      
      // Calcular duração do bloqueio com base no nível de ameaça
      const threatLevel = this.getThreatLevel(identifier);
      let blockDuration = this.config.blockDurationMs * threatLevel.multiplier;

      // Delay progressivo baseado nas violações
      if (this.config.enableProgressiveDelay && entry.violations > 1) {
        blockDuration *= Math.pow(this.config.progressiveMultiplier!, entry.violations - 1);
      }

      entry.blockedUntil = now + blockDuration;

      // Atualizar nível de ameaça
      this.updateThreatLevel(identifier, entry.violations);

      // Monitorar violação
      securityMonitor.monitorRateLimit(identifier, action, {
        status: 'violated',
        violations: entry.violations,
        blockDuration: Math.ceil(blockDuration / 1000),
        threatLevel: threatLevel.level,
        requestCount: entry.count
      });

      logger.warn('Rate limit excedido', {
        component: 'ADVANCED_RATE_LIMIT',
        identifier: identifier.substring(0, 8) + '***',
        action,
        violations: entry.violations,
        blockDuration: Math.ceil(blockDuration / 1000),
        threatLevel: threatLevel.level
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        blockDuration: Math.ceil(blockDuration / 1000),
        threatLevel: threatLevel.level
      };
    }

    return {
      allowed: true,
      remaining,
      resetTime: entry.firstHit + this.config.windowMs
    };
  }

  // Obter nível de ameaça
  private getThreatLevel(identifier: string): ThreatLevel {
    const existing = this.threatLevels.get(identifier);
    if (existing) return existing;

    // Nível padrão
    const defaultLevel: ThreatLevel = {
      level: 'low',
      multiplier: 1,
      blockDuration: this.config.blockDurationMs
    };

    this.threatLevels.set(identifier, defaultLevel);
    return defaultLevel;
  }

  // Atualizar nível de ameaça
  private updateThreatLevel(identifier: string, violations: number): void {
    let level: ThreatLevel['level'] = 'low';
    let multiplier = 1;

    if (violations >= 10) {
      level = 'critical';
      multiplier = 8;
    } else if (violations >= 5) {
      level = 'high';
      multiplier = 4;
    } else if (violations >= 3) {
      level = 'medium';
      multiplier = 2;
    }

    const threatLevel: ThreatLevel = {
      level,
      multiplier,
      blockDuration: this.config.blockDurationMs * multiplier
    };

    this.threatLevels.set(identifier, threatLevel);

    // Log de escalação de ameaça
    if (multiplier > 1) {
      logger.warn('Nível de ameaça escalado', {
        component: 'ADVANCED_RATE_LIMIT',
        identifier: identifier.substring(0, 8) + '***',
        level,
        violations,
        multiplier
      });
    }
  }

  // Resetar contador para um identificador
  reset(identifier: string, action: string = 'general'): void {
    const key = `${identifier}:${action}`;
    this.requests.delete(key);
    
    logger.info('Rate limit resetado', {
      component: 'ADVANCED_RATE_LIMIT',
      identifier: identifier.substring(0, 8) + '***',
      action
    });
  }

  // Perdoar violações (reduzir nível de ameaça)
  forgive(identifier: string): void {
    const threatLevel = this.threatLevels.get(identifier);
    if (threatLevel && threatLevel.level !== 'low') {
      // Reduzir nível de ameaça gradualmente
      let newLevel: ThreatLevel['level'] = 'low';
      let newMultiplier = 1;

      switch (threatLevel.level) {
        case 'critical':
          newLevel = 'high';
          newMultiplier = 4;
          break;
        case 'high':
          newLevel = 'medium';
          newMultiplier = 2;
          break;
        case 'medium':
          newLevel = 'low';
          newMultiplier = 1;
          break;
      }

      this.threatLevels.set(identifier, {
        level: newLevel,
        multiplier: newMultiplier,
        blockDuration: this.config.blockDurationMs * newMultiplier
      });

      logger.info('Nível de ameaça reduzido', {
        component: 'ADVANCED_RATE_LIMIT',
        identifier: identifier.substring(0, 8) + '***',
        oldLevel: threatLevel.level,
        newLevel
      });
    }
  }

  // Limpeza de entradas antigas
  private cleanup(): void {
    const now = Date.now();
    let removedEntries = 0;
    let removedThreats = 0;

    // Limpar requisições antigas
    this.requests.forEach((entry, key) => {
      // Remover se a janela expirou e não está bloqueado
      if (now - entry.lastHit > this.config.windowMs && 
          (!entry.blockedUntil || now > entry.blockedUntil)) {
        this.requests.delete(key);
        removedEntries++;
      }
    });

    // Limpar níveis de ameaça antigos (após 1 hora de inatividade)
    const oneHourAgo = now - 60 * 60 * 1000;
    this.threatLevels.forEach((threat, identifier) => {
      const hasRecentActivity = Array.from(this.requests.keys()).some(
        key => key.startsWith(identifier + ':')
      );
      
      if (!hasRecentActivity) {
        this.threatLevels.delete(identifier);
        removedThreats++;
      }
    });

    if (removedEntries > 0 || removedThreats > 0) {
      logger.info('Limpeza de rate limiting concluída', {
        component: 'ADVANCED_RATE_LIMIT',
        removedEntries,
        removedThreats,
        activeEntries: this.requests.size,
        activeThreats: this.threatLevels.size
      });
    }
  }

  // Obter estatísticas
  getStats(): {
    activeRequests: number;
    blockedRequests: number;
    totalThreatLevels: number;
    threatDistribution: Record<string, number>;
  } {
    const now = Date.now();
    let blockedRequests = 0;
    
    this.requests.forEach(entry => {
      if (entry.blockedUntil && now < entry.blockedUntil) {
        blockedRequests++;
      }
    });

    const threatDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
    this.threatLevels.forEach(threat => {
      threatDistribution[threat.level]++;
    });

    return {
      activeRequests: this.requests.size,
      blockedRequests,
      totalThreatLevels: this.threatLevels.size,
      threatDistribution
    };
  }
}

// Instâncias pré-configuradas para diferentes casos
export const loginRateLimit = new AdvancedRateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutos
  blockDurationMs: 30 * 60 * 1000, // 30 minutos
  enableProgressiveDelay: true,
  progressiveMultiplier: 2
});

export const apiRateLimit = new AdvancedRateLimit({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minuto
  blockDurationMs: 60 * 1000, // 1 minuto
  enableProgressiveDelay: false
});

export const passwordResetRateLimit = new AdvancedRateLimit({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hora
  blockDurationMs: 2 * 60 * 60 * 1000, // 2 horas
  enableProgressiveDelay: true,
  progressiveMultiplier: 3
});

export { AdvancedRateLimit };
