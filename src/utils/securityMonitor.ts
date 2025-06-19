
import { logger } from './logger';
import { supabase } from '@/lib/supabase';

interface SecurityEvent {
  type: 'login_attempt' | 'suspicious_activity' | 'rate_limit' | 'xss_attempt' | 'injection_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

interface SecurityPattern {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 1000;
  private patterns: SecurityPattern[] = [];

  private constructor() {
    this.initializeSecurityPatterns();
  }

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  // Inicializar padrões de segurança
  private initializeSecurityPatterns(): void {
    this.patterns = [
      {
        id: 'xss_basic',
        name: 'XSS Básico',
        pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        severity: 'high',
        description: 'Tentativa de injeção de script'
      },
      {
        id: 'sql_injection',
        name: 'SQL Injection',
        pattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)|('|(\\x[0-9a-f]{2})+)/gi,
        severity: 'critical',
        description: 'Tentativa de injeção SQL'
      },
      {
        id: 'path_traversal',
        name: 'Path Traversal',
        pattern: /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/gi,
        severity: 'high',
        description: 'Tentativa de traversal de diretório'
      },
      {
        id: 'command_injection',
        name: 'Command Injection',
        pattern: /(\||;|&|`|\$\(|\$\{|<|>)/g,
        severity: 'critical',
        description: 'Tentativa de injeção de comando'
      }
    ];
  }

  // Monitorar entrada de dados
  monitorInput(input: string, context: string, userId?: string): void {
    if (!input || typeof input !== 'string') return;

    this.patterns.forEach(pattern => {
      if (pattern.pattern.test(input)) {
        this.recordSecurityEvent({
          type: pattern.name.includes('SQL') ? 'injection_attempt' : 'xss_attempt',
          severity: pattern.severity,
          userId,
          details: {
            context,
            pattern: pattern.name,
            description: pattern.description,
            inputSample: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
            fullInput: input.length <= 200 ? input : '[TOO_LONG]'
          },
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // Monitorar tentativa de login
  monitorLoginAttempt(email: string, success: boolean, details?: Record<string, any>): void {
    this.recordSecurityEvent({
      type: 'login_attempt',
      severity: success ? 'low' : 'medium',
      details: {
        email: email.substring(0, 3) + '***@' + email.split('@')[1],
        success,
        ...details
      },
      timestamp: new Date().toISOString()
    });

    // Se falha, verificar padrões suspeitos
    if (!success) {
      this.analyzeFailedLogin(email);
    }
  }

  // Monitorar atividade suspeita
  monitorSuspiciousActivity(
    activity: string, 
    userId?: string, 
    details?: Record<string, any>
  ): void {
    this.recordSecurityEvent({
      type: 'suspicious_activity',
      severity: 'medium',
      userId,
      details: {
        activity,
        ...details
      },
      timestamp: new Date().toISOString()
    });
  }

  // Monitorar rate limiting
  monitorRateLimit(identifier: string, action: string, details?: Record<string, any>): void {
    this.recordSecurityEvent({
      type: 'rate_limit',
      severity: 'medium',
      details: {
        identifier: identifier.substring(0, 8) + '***',
        action,
        ...details
      },
      timestamp: new Date().toISOString()
    });
  }

  // Registrar evento de segurança
  private recordSecurityEvent(event: SecurityEvent): void {
    // Adicionar informações do navegador se disponível
    if (typeof window !== 'undefined') {
      event.userAgent = navigator.userAgent.substring(0, 100);
    }

    this.events.push(event);

    // Manter apenas os últimos eventos
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Log do evento
    logger.warn(`🔍 [SECURITY MONITOR] ${event.type}`, {
      component: 'SECURITY_MONITOR',
      severity: event.severity,
      type: event.type,
      userId: event.userId?.substring(0, 8) + '***',
      details: event.details
    });

    // Se severidade alta ou crítica, registrar no banco
    if (event.severity === 'high' || event.severity === 'critical') {
      this.persistSecurityEvent(event);
    }

    // Analisar padrões em tempo real
    this.analyzeSecurityPatterns();
  }

  // Persistir evento crítico no banco
  private async persistSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        user_id: event.userId || '00000000-0000-0000-0000-000000000000',
        event_type: 'security_event',
        action: event.type,
        details: {
          severity: event.severity,
          ...event.details,
          timestamp: event.timestamp,
          userAgent: event.userAgent
        },
        severity: event.severity
      });
    } catch (error) {
      logger.error('Erro ao persistir evento de segurança', error);
    }
  }

  // Analisar padrões de segurança
  private analyzeSecurityPatterns(): void {
    const recentEvents = this.events.filter(
      event => Date.now() - new Date(event.timestamp).getTime() < 60000 // Últimos 1 minuto
    );

    // Detectar múltiplas tentativas do mesmo tipo
    const eventCounts = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(eventCounts).forEach(([type, count]) => {
      if (count >= 5) { // 5 ou mais eventos do mesmo tipo em 1 minuto
        logger.warn(`🚨 [SECURITY ALERT] Padrão suspeito detectado`, {
          component: 'SECURITY_MONITOR',
          pattern: `${count} eventos do tipo ${type} em 1 minuto`,
          severity: 'high'
        });

        this.recordSecurityEvent({
          type: 'suspicious_activity',
          severity: 'high',
          details: {
            pattern: 'multiple_events',
            eventType: type,
            count,
            timeWindow: '1 minute'
          },
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // Analisar falha de login
  private analyzeFailedLogin(email: string): void {
    const recentFailures = this.events.filter(
      event => 
        event.type === 'login_attempt' &&
        event.details.success === false &&
        event.details.email.includes(email.split('@')[1]) &&
        Date.now() - new Date(event.timestamp).getTime() < 15 * 60 * 1000 // Últimos 15 minutos
    );

    if (recentFailures.length >= 3) {
      logger.warn(`🚨 [SECURITY ALERT] Múltiplas tentativas de login falhadas`, {
        component: 'SECURITY_MONITOR',
        email: email.substring(0, 3) + '***@' + email.split('@')[1],
        attempts: recentFailures.length,
        timeWindow: '15 minutes'
      });
    }
  }

  // Obter estatísticas de segurança
  getSecurityStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    recentEvents: SecurityEvent[];
  } {
    const eventsByType = this.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsBySeverity = this.events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentEvents = this.events
      .filter(event => Date.now() - new Date(event.timestamp).getTime() < 60 * 60 * 1000) // Última hora
      .slice(-20); // Últimos 20 eventos

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      recentEvents
    };
  }

  // Limpar eventos antigos
  cleanupOldEvents(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.events = this.events.filter(
      event => new Date(event.timestamp).getTime() > oneHourAgo
    );
  }
}

export const securityMonitor = SecurityMonitor.getInstance();

// Limpeza automática a cada hora
if (typeof window !== 'undefined') {
  setInterval(() => {
    securityMonitor.cleanupOldEvents();
  }, 60 * 60 * 1000);
}
