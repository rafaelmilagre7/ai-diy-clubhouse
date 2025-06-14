import { logger } from './logger';
import { secureLogger } from './secureLogger';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
  statusCode: number;
  trustProxy?: boolean;
  validate?: {
    trustProxy?: boolean;
  };
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
}

type ThreatType = 'high_frequency' | 'bot_detected' | 'brute_force' | 'distributed_attack';

interface RateLimitRecord {
  count: number;
  firstHit: number;
  lastHit: number;
  blockedUntil?: number;
}

class IntelligentRateLimit {
  private options: RateLimitOptions;
  private records: Map<string, RateLimitRecord> = new Map();
  private blockedIPs: Set<string> = new Set();

  constructor(options: RateLimitOptions) {
    this.options = {
      trustProxy: false,
      validate: { trustProxy: false },
      skipFailedRequests: false,
      skipSuccessfulRequests: false,
      ...options
    };

    // Limpeza periódica para evitar estouro de memória
    setInterval(() => {
      this.cleanupOldRecords();
      this.cleanupBlockedIPs();
    }, 60 * 1000);
  }

  apply(key: string): { success: boolean; message?: string; statusCode?: number } {
    if (this.isBlocked(key)) {
      return {
        success: false,
        message: this.options.message,
        statusCode: this.options.statusCode
      };
    }

    const record = this.getRecord(key);
    const now = Date.now();

    if (!record) {
      this.records.set(key, {
        count: 1,
        firstHit: now,
        lastHit: now
      });
    } else {
      record.count++;
      record.lastHit = now;

      if (record.count > this.options.max) {
        this.blockIP(key);
        this.logSecurityEvent('brute_force', 'high', key, { count: record.count });
        return {
          success: false,
          message: this.options.message,
          statusCode: this.options.statusCode
        };
      }
    }

    return { success: true };
  }

  isBlocked(key: string): boolean {
    if (!this.blockedIPs.has(key)) {
      return false;
    }

    const record = this.getRecord(key);
    if (!record || !record.blockedUntil) {
      return false;
    }

    return record.blockedUntil > Date.now();
  }

  blockIP(key: string): void {
    this.blockedIPs.add(key);
    const record = this.getRecord(key);
    if (record) {
      record.blockedUntil = Date.now() + (5 * 60 * 1000); // Bloqueio por 5 minutos
    }
  }

  private getRecord(key: string): RateLimitRecord | undefined {
    return this.records.get(key);
  }

  private cleanupOldRecords(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (now - record.lastHit > this.options.windowMs) {
        this.records.delete(key);
      }
    }
  }

  private cleanupBlockedIPs(): void {
    for (const ip of this.blockedIPs.values()) {
      if (!this.isBlocked(ip)) {
        this.blockedIPs.delete(ip);
      }
    }
  }

  private logSecurityEvent(type: ThreatType, severity: 'low' | 'medium' | 'high' | 'critical', source: string, details: Record<string, any>) {
    if (process.env.NODE_ENV === 'production') return;
    
    try {
      logger.error(`🚨 [SECURITY] ${type} detectado`, {
        component: 'INTELLIGENT_RATE_LIMIT',
        type,
        severity,
        source,
        timestamp: new Date().toISOString(), // CORREÇÃO: Convertendo para string
        details
      });

      secureLogger.security({
        type: 'system',
        severity,
        description: `Intelligent rate limit triggered: ${type}`,
        details: {
          type,
          source,
          ...details
        }
      }, 'INTELLIGENT_RATE_LIMIT', {
        timestamp: new Date().toISOString(), // CORREÇÃO: Convertendo para string
        source
      });
    } catch (error) {
      // Falha silenciosamente em caso de erro de logging
    }
  }
}

export const rateLimit = (options: RateLimitOptions) => {
  const limiter = new IntelligentRateLimit(options);
  return (key: string) => limiter.apply(key);
};
