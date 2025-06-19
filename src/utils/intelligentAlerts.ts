
import { logger } from './logger';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Alert {
  id: string;
  type: 'security' | 'performance' | 'system' | 'user_activity';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  details: Record<string, any>;
  timestamp: string;
  acknowledged: boolean;
  userId?: string;
  source: string;
}

interface AlertRule {
  id: string;
  name: string;
  type: Alert['type'];
  condition: (context: any) => boolean;
  severity: Alert['severity'];
  message: string;
  cooldownMs: number;
  enabled: boolean;
}

interface AlertMetrics {
  totalAlerts: number;
  alertsBySeverity: Record<string, number>;
  alertsByType: Record<string, number>;
  acknowledgedAlerts: number;
  recentAlerts: Alert[];
}

class IntelligentAlerts {
  private static instance: IntelligentAlerts;
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];
  private cooldowns: Map<string, number> = new Map();
  private readonly MAX_ALERTS = 500;

  private constructor() {
    this.initializeDefaultRules();
  }

  static getInstance(): IntelligentAlerts {
    if (!IntelligentAlerts.instance) {
      IntelligentAlerts.instance = new IntelligentAlerts();
    }
    return IntelligentAlerts.instance;
  }

  // Inicializar regras padrão
  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'multiple_failed_logins',
        name: 'Múltiplas tentativas de login falhadas',
        type: 'security',
        condition: (context) => context.failedLogins >= 5,
        severity: 'warning',
        message: 'Detectadas {failedLogins} tentativas de login falhadas nos últimos 15 minutos',
        cooldownMs: 15 * 60 * 1000, // 15 minutos
        enabled: true
      },
      {
        id: 'xss_attempts',
        name: 'Tentativas de XSS detectadas',
        type: 'security',
        condition: (context) => context.xssAttempts > 0,
        severity: 'error',
        message: 'Detectadas {xssAttempts} tentativas de ataque XSS',
        cooldownMs: 5 * 60 * 1000, // 5 minutos
        enabled: true
      },
      {
        id: 'sql_injection_attempts',
        name: 'Tentativas de SQL Injection',
        type: 'security',
        condition: (context) => context.sqlInjectionAttempts > 0,
        severity: 'critical',
        message: 'Detectadas {sqlInjectionAttempts} tentativas de SQL Injection',
        cooldownMs: 2 * 60 * 1000, // 2 minutos
        enabled: true
      },
      {
        id: 'high_rate_limit_violations',
        name: 'Alto número de violações de rate limit',
        type: 'security',
        condition: (context) => context.rateLimitViolations >= 10,
        severity: 'warning',
        message: 'Detectadas {rateLimitViolations} violações de rate limit',
        cooldownMs: 10 * 60 * 1000, // 10 minutos
        enabled: true
      },
      {
        id: 'suspicious_user_activity',
        name: 'Atividade suspeita de usuário',
        type: 'user_activity',
        condition: (context) => context.suspiciousActivities >= 3,
        severity: 'warning',
        message: 'Detectadas {suspiciousActivities} atividades suspeitas de usuários',
        cooldownMs: 20 * 60 * 1000, // 20 minutos
        enabled: true
      },
      {
        id: 'system_error_spike',
        name: 'Pico de erros do sistema',
        type: 'system',
        condition: (context) => context.systemErrors >= 20,
        severity: 'error',
        message: 'Detectados {systemErrors} erros do sistema na última hora',
        cooldownMs: 30 * 60 * 1000, // 30 minutos
        enabled: true
      }
    ];

    logger.info('Regras de alerta inicializadas', {
      component: 'INTELLIGENT_ALERTS',
      rulesCount: this.rules.length
    });
  }

  // Processar contexto e disparar alertas
  processContext(context: Record<string, any>): void {
    this.rules.forEach(rule => {
      if (!rule.enabled) return;

      try {
        if (rule.condition(context)) {
          this.triggerAlert(rule, context);
        }
      } catch (error) {
        logger.error('Erro ao processar regra de alerta', error, {
          component: 'INTELLIGENT_ALERTS',
          ruleId: rule.id
        });
      }
    });
  }

  // Disparar alerta
  private triggerAlert(rule: AlertRule, context: Record<string, any>): void {
    const now = Date.now();
    const cooldownKey = rule.id;
    const lastTrigger = this.cooldowns.get(cooldownKey);

    // Verificar cooldown
    if (lastTrigger && now - lastTrigger < rule.cooldownMs) {
      return; // Ainda em cooldown
    }

    // Atualizar cooldown
    this.cooldowns.set(cooldownKey, now);

    // Interpolar valores no template da mensagem
    let message = rule.message;
    Object.keys(context).forEach(key => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), context[key]);
    });

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      message,
      details: {
        ruleId: rule.id,
        context: this.sanitizeContext(context),
        triggeredAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      acknowledged: false,
      source: 'intelligent_alerts'
    };

    this.alerts.push(alert);

    // Manter apenas os últimos alertas
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts = this.alerts.slice(-this.MAX_ALERTS);
    }

    // Log do alerta
    logger.warn(`🚨 [ALERT] ${alert.title}`, {
      component: 'INTELLIGENT_ALERTS',
      severity: alert.severity,
      type: alert.type,
      message: alert.message,
      details: alert.details
    });

    // Mostrar toast para alertas críticos
    if (alert.severity === 'critical' || alert.severity === 'error') {
      this.showToastAlert(alert);
    }

    // Persistir alerta crítico
    if (alert.severity === 'critical') {
      this.persistAlert(alert);
    }

    // Notificar administradores se necessário
    this.notifyAdmins(alert);
  }

  // Mostrar toast do alerta
  private showToastAlert(alert: Alert): void {
    if (typeof window === 'undefined') return;

    const variant = alert.severity === 'critical' ? 'destructive' : 'default';
    
    toast(alert.title, {
      description: alert.message,
      // @ts-ignore - variant pode não estar tipado corretamente
      variant,
      duration: alert.severity === 'critical' ? 10000 : 5000,
    });
  }

  // Persistir alerta no banco
  private async persistAlert(alert: Alert): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        user_id: alert.userId || '00000000-0000-0000-0000-000000000000',
        event_type: 'security_alert',
        action: `alert_${alert.type}`,
        details: {
          alertId: alert.id,
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          type: alert.type,
          ...alert.details
        },
        severity: alert.severity
      });
    } catch (error) {
      logger.error('Erro ao persistir alerta', error);
    }
  }

  // Notificar administradores
  private async notifyAdmins(alert: Alert): Promise<void> {
    if (alert.severity !== 'critical' && alert.severity !== 'error') return;

    try {
      // Buscar administradores
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, email, name')
        .eq('role', 'admin');

      if (!admins?.length) return;

      // Criar notificações para cada admin
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        title: `🚨 ${alert.title}`,
        message: alert.message,
        type: 'security_alert',
        severity: alert.severity,
        data: {
          alertId: alert.id,
          alertType: alert.type,
          timestamp: alert.timestamp
        }
      }));

      await supabase.from('notifications').insert(notifications);

      logger.info('Administradores notificados sobre alerta', {
        component: 'INTELLIGENT_ALERTS',
        alertId: alert.id,
        adminCount: admins.length
      });
    } catch (error) {
      logger.error('Erro ao notificar administradores', error);
    }
  }

  // Sanitizar contexto para logs
  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    Object.keys(context).forEach(key => {
      const value = context[key];
      
      // Não incluir informações sensíveis
      if (typeof value === 'string' && value.includes('@')) {
        sanitized[key] = '[EMAIL_REDACTED]';
      } else if (key.toLowerCase().includes('password') || 
                 key.toLowerCase().includes('token') ||
                 key.toLowerCase().includes('secret')) {
        sanitized[key] = '[SENSITIVE_DATA]';
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }

  // Reconhecer alerta
  acknowledgeAlert(alertId: string, userId?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.details.acknowledgedBy = userId;
    alert.details.acknowledgedAt = new Date().toISOString();

    logger.info('Alerta reconhecido', {
      component: 'INTELLIGENT_ALERTS',
      alertId,
      userId: userId?.substring(0, 8) + '***'
    });

    return true;
  }

  // Obter alertas
  getAlerts(filters?: {
    type?: Alert['type'];
    severity?: Alert['severity'];
    acknowledged?: boolean;
    limit?: number;
  }): Alert[] {
    let filteredAlerts = [...this.alerts];

    if (filters) {
      if (filters.type) {
        filteredAlerts = filteredAlerts.filter(a => a.type === filters.type);
      }
      if (filters.severity) {
        filteredAlerts = filteredAlerts.filter(a => a.severity === filters.severity);
      }
      if (filters.acknowledged !== undefined) {
        filteredAlerts = filteredAlerts.filter(a => a.acknowledged === filters.acknowledged);
      }
    }

    // Ordenar por timestamp (mais recentes primeiro)
    filteredAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filters?.limit) {
      filteredAlerts = filteredAlerts.slice(0, filters.limit);
    }

    return filteredAlerts;
  }

  // Obter métricas de alertas
  getMetrics(): AlertMetrics {
    const alertsBySeverity = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const alertsByType = this.alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const acknowledgedAlerts = this.alerts.filter(a => a.acknowledged).length;
    const recentAlerts = this.getAlerts({ limit: 10 });

    return {
      totalAlerts: this.alerts.length,
      alertsBySeverity,
      alertsByType,
      acknowledgedAlerts,
      recentAlerts
    };
  }

  // Adicionar regra customizada
  addRule(rule: Omit<AlertRule, 'id'>): string {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.rules.push({ ...rule, id });
    
    logger.info('Regra de alerta adicionada', {
      component: 'INTELLIGENT_ALERTS',
      ruleId: id,
      ruleName: rule.name
    });
    
    return id;
  }

  // Remover regra
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index === -1) return false;

    this.rules.splice(index, 1);
    this.cooldowns.delete(ruleId);
    
    logger.info('Regra de alerta removida', {
      component: 'INTELLIGENT_ALERTS',
      ruleId
    });
    
    return true;
  }

  // Limpar alertas antigos
  cleanupOldAlerts(): void {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const oldCount = this.alerts.length;
    
    this.alerts = this.alerts.filter(
      alert => new Date(alert.timestamp).getTime() > oneWeekAgo
    );

    if (oldCount !== this.alerts.length) {
      logger.info('Alertas antigos removidos', {
        component: 'INTELLIGENT_ALERTS',
        removed: oldCount - this.alerts.length,
        remaining: this.alerts.length
      });
    }
  }
}

export const intelligentAlerts = IntelligentAlerts.getInstance();

// Limpeza automática semanal
if (typeof window !== 'undefined') {
  setInterval(() => {
    intelligentAlerts.cleanupOldAlerts();
  }, 24 * 60 * 60 * 1000); // Diariamente
}
