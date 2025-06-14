
import { logger } from '@/utils/logger';

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blocked: boolean;
  pattern: 'normal' | 'suspicious' | 'malicious';
  userAgent?: string;
  consecutiveFailures: number;
}

interface SecurityAlert {
  type: 'high_frequency' | 'bot_detected' | 'brute_force' | 'distributed_attack';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: number;
  details: Record<string, any>;
}

class IntelligentRateLimit {
  private attempts = new Map<string, RateLimitEntry>();
  private whitelist = new Set<string>();
  private blacklist = new Set<string>();
  private alerts: SecurityAlert[] = [];
  private readonly cleanupInterval: NodeJS.Timeout;

  // Configurações adaptáveis
  private config = {
    maxAttempts: {
      normal: 10,      // Usuários normais
      suspicious: 5,   // Comportamento suspeito
      malicious: 2     // Comportamento malicioso
    },
    windowMs: 60 * 1000, // 1 minuto
    blockDuration: {
      normal: 5 * 60 * 1000,     // 5 minutos
      suspicious: 15 * 60 * 1000, // 15 minutos  
      malicious: 60 * 60 * 1000   // 1 hora
    },
    patternDetection: {
      botUserAgents: ['bot', 'crawler', 'spider', 'scraper'],
      suspiciousIntervals: [100, 200, 500, 1000], // ms entre requests
      humanLikeMinInterval: 800 // ms mínimo entre ações humanas
    }
  };

  constructor() {
    // Limpeza a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);

    // IPs confiáveis (pode ser expandido)
    this.whitelist.add('127.0.0.1');
    this.whitelist.add('localhost');
  }

  // INTELIGÊNCIA: Detectar padrões de comportamento
  private analyzePattern(key: string, entry: RateLimitEntry): 'normal' | 'suspicious' | 'malicious' {
    const now = Date.now();
    const timeSinceFirst = now - entry.firstAttempt;
    const avgInterval = timeSinceFirst / entry.count;

    // Detectar bots por User Agent
    if (entry.userAgent) {
      const isBot = this.config.patternDetection.botUserAgents.some(pattern => 
        entry.userAgent!.toLowerCase().includes(pattern)
      );
      if (isBot) {
        this.createAlert('bot_detected', 'high', key, {
          userAgent: entry.userAgent,
          attempts: entry.count
        });
        return 'malicious';
      }
    }

    // Detectar ataques automatizados por intervalos regulares
    const isSuspiciousInterval = this.config.patternDetection.suspiciousIntervals.some(interval =>
      Math.abs(avgInterval - interval) < 50 // Margem de 50ms
    );

    if (isSuspiciousInterval) {
      this.createAlert('high_frequency', 'medium', key, {
        avgInterval,
        attempts: entry.count,
        pattern: 'automated'
      });
      return 'suspicious';
    }

    // Detectar tentativas muito rápidas (menos humanas)
    if (avgInterval < this.config.patternDetection.humanLikeMinInterval && entry.count > 3) {
      return 'suspicious';
    }

    // Detectar brute force por muitas falhas consecutivas
    if (entry.consecutiveFailures > 8) {
      this.createAlert('brute_force', 'high', key, {
        consecutiveFailures: entry.consecutiveFailures,
        timePeriod: timeSinceFirst
      });
      return 'malicious';
    }

    return 'normal';
  }

  // INTELIGÊNCIA: Criar alertas de segurança
  private createAlert(type: SecurityAlert['type'], severity: SecurityAlert['severity'], source: string, details: Record<string, any>): void {
    const alert: SecurityAlert = {
      type,
      severity,
      source: source.substring(0, 20) + '***', // Mascarar para privacidade
      timestamp: Date.now(),
      details
    };

    this.alerts.push(alert);

    // Manter apenas últimos 100 alertas
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    logger.warn(`[SECURITY-ALERT] ${type.toUpperCase()}`, {
      ...alert,
      component: 'IntelligentRateLimit'
    });

    // Auto-blacklist para ataques críticos
    if (severity === 'critical' || type === 'brute_force') {
      this.blacklist.add(source);
      logger.error(`[SECURITY] IP ${source.substring(0, 10)}*** adicionado à blacklist`, {
        reason: type,
        severity
      });
    }
  }

  // RATE LIMITING: Verificar se operação é permitida
  checkRateLimit(
    identifier: string, 
    operation: string = 'general',
    userAgent?: string,
    isFailure: boolean = false
  ): { allowed: boolean; reason?: string; retryAfter?: number } {
    // Verificar whitelist
    if (this.whitelist.has(identifier)) {
      return { allowed: true };
    }

    // Verificar blacklist
    if (this.blacklist.has(identifier)) {
      return { 
        allowed: false, 
        reason: 'Endereço bloqueado por atividade maliciosa',
        retryAfter: this.config.blockDuration.malicious
      };
    }

    const key = `${identifier}:${operation}`;
    const now = Date.now();
    
    let entry = this.attempts.get(key);
    
    if (!entry) {
      entry = {
        count: 0,
        firstAttempt: now,
        lastAttempt: now,
        blocked: false,
        pattern: 'normal',
        userAgent,
        consecutiveFailures: 0
      };
    }

    // Reset da janela se passou do tempo limite
    if (now - entry.firstAttempt > this.config.windowMs) {
      entry = {
        count: 0,
        firstAttempt: now,
        lastAttempt: now,
        blocked: false,
        pattern: 'normal',
        userAgent: userAgent || entry.userAgent,
        consecutiveFailures: isFailure ? entry.consecutiveFailures + 1 : 0
      };
    } else {
      entry.count++;
      entry.lastAttempt = now;
      if (isFailure) {
        entry.consecutiveFailures++;
      } else {
        entry.consecutiveFailures = 0;
      }
      if (userAgent) {
        entry.userAgent = userAgent;
      }
    }

    // Analisar padrão de comportamento
    entry.pattern = this.analyzePattern(key, entry);

    // Verificar se deve bloquear baseado no padrão
    const maxAttemptsForPattern = this.config.maxAttempts[entry.pattern];
    
    if (entry.count > maxAttemptsForPattern) {
      entry.blocked = true;
      const blockDuration = this.config.blockDuration[entry.pattern];
      
      this.attempts.set(key, entry);
      
      // Criar alerta se não foi criado ainda
      if (entry.pattern !== 'normal') {
        this.createAlert('high_frequency', entry.pattern === 'malicious' ? 'critical' : 'medium', identifier, {
          operation,
          attempts: entry.count,
          pattern: entry.pattern
        });
      }
      
      return {
        allowed: false,
        reason: `Taxa de tentativas muito alta. Padrão detectado: ${entry.pattern}`,
        retryAfter: blockDuration
      };
    }

    this.attempts.set(key, entry);

    // Log para tentativas suspeitas
    if (entry.pattern !== 'normal') {
      logger.warn('[RATE-LIMIT] Atividade suspeita detectada', {
        identifier: identifier.substring(0, 10) + '***',
        operation,
        pattern: entry.pattern,
        attempts: entry.count,
        consecutiveFailures: entry.consecutiveFailures
      });
    }

    return { allowed: true };
  }

  // ADMINISTRAÇÃO: Adicionar IP à whitelist
  addToWhitelist(identifier: string): void {
    this.whitelist.add(identifier);
    this.blacklist.delete(identifier); // Remove da blacklist se estiver
    logger.info(`[RATE-LIMIT] IP ${identifier.substring(0, 10)}*** adicionado à whitelist`);
  }

  // ADMINISTRAÇÃO: Remover IP da blacklist
  removeFromBlacklist(identifier: string): void {
    this.blacklist.delete(identifier);
    logger.info(`[RATE-LIMIT] IP ${identifier.substring(0, 10)}*** removido da blacklist`);
  }

  // ADMINISTRAÇÃO: Limpar histórico de um IP
  clearHistory(identifier: string): void {
    const keysToRemove = Array.from(this.attempts.keys()).filter(key => 
      key.startsWith(identifier + ':')
    );
    
    keysToRemove.forEach(key => this.attempts.delete(key));
    
    logger.info(`[RATE-LIMIT] Histórico limpo para ${identifier.substring(0, 10)}***`);
  }

  // MONITORAMENTO: Obter alertas recentes
  getRecentAlerts(limit: number = 10): SecurityAlert[] {
    return this.alerts.slice(-limit);
  }

  // MONITORAMENTO: Obter estatísticas
  getStats() {
    const now = Date.now();
    const activeEntries = Array.from(this.attempts.values()).filter(entry => 
      now - entry.firstAttempt < this.config.windowMs
    );

    const patternCounts = activeEntries.reduce((acc, entry) => {
      acc[entry.pattern] = (acc[entry.pattern] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTrackedIPs: this.attempts.size,
      activeRequests: activeEntries.length,
      whitelistedIPs: this.whitelist.size,
      blacklistedIPs: this.blacklist.size,
      recentAlerts: this.alerts.length,
      patternDistribution: patternCounts,
      lastCleanup: now
    };
  }

  // MANUTENÇÃO: Limpeza de entradas antigas
  private cleanup(): void {
    const now = Date.now();
    const maxAge = this.config.windowMs * 2; // Manter por 2x a janela
    let cleanedCount = 0;

    for (const [key, entry] of this.attempts.entries()) {
      if (now - entry.lastAttempt > maxAge) {
        this.attempts.delete(key);
        cleanedCount++;
      }
    }

    // Limpar alertas antigos (mais de 1 hora)
    const alertsAge = 60 * 60 * 1000;
    const alertsBefore = this.alerts.length;
    this.alerts = this.alerts.filter(alert => now - alert.timestamp < alertsAge);

    if (cleanedCount > 0 || this.alerts.length < alertsBefore) {
      logger.info(`[RATE-LIMIT] Limpeza: ${cleanedCount} entradas, ${alertsBefore - this.alerts.length} alertas`);
    }
  }

  // Destruir instância
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.attempts.clear();
    this.alerts.length = 0;
  }
}

export const intelligentRateLimit = new IntelligentRateLimit();

// Cleanup ao descarregar página
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    intelligentRateLimit.destroy();
  });
}
