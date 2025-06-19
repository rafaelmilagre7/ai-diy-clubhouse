
import { securityAuditor } from './securityAuditor';
import { securityMonitor } from './securityMonitor';
import { intelligentAlerts } from './intelligentAlerts';
import { advancedInputValidation } from './advancedInputValidation';
import { loginRateLimit, apiRateLimit } from './advancedRateLimit';
import { logger } from './logger';

interface SecurityDashboard {
  auditScore: number;
  monitoringStatus: 'active' | 'inactive' | 'error';
  activeAlerts: number;
  criticalAlerts: number;
  rateLimitStats: {
    loginBlocked: number;
    apiBlocked: number;
  };
  validationStats: {
    totalRules: number;
    violationsToday: number;
  };
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdate: string;
}

class SecurityOrchestrator {
  private static instance: SecurityOrchestrator;
  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): SecurityOrchestrator {
    if (!SecurityOrchestrator.instance) {
      SecurityOrchestrator.instance = new SecurityOrchestrator();
    }
    return SecurityOrchestrator.instance;
  }

  // Inicializar sistema de segurança
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info('🔒 Inicializando sistema de segurança avançado...', {
        component: 'SECURITY_ORCHESTRATOR'
      });

      // Inicializar componentes
      securityAuditor.startContinuousAudit();
      advancedInputValidation.applyCSP();

      // Configurar verificações de saúde
      this.startHealthChecks();

      // Realizar auditoria inicial
      const initialAudit = await securityAuditor.performSecurityAudit();
      
      if (!initialAudit.isSecure) {
        intelligentAlerts.processContext({
          systemSecurityScore: initialAudit.score,
          securityIssues: initialAudit.issues.length,
          initialAudit: true
        });
      }

      this.isInitialized = true;

      logger.info('✅ Sistema de segurança avançado inicializado com sucesso', {
        component: 'SECURITY_ORCHESTRATOR',
        auditScore: initialAudit.score,
        isSecure: initialAudit.isSecure
      });

    } catch (error) {
      logger.error('❌ Erro ao inicializar sistema de segurança', error, {
        component: 'SECURITY_ORCHESTRATOR'
      });
      throw error;
    }
  }

  // Verificações de saúde periódicas
  private startHealthChecks(): void {
    if (this.healthCheckInterval) return;

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 5 * 60 * 1000); // A cada 5 minutos

    logger.info('Verificações de saúde do sistema iniciadas', {
      component: 'SECURITY_ORCHESTRATOR',
      interval: '5 minutos'
    });
  }

  // Realizar verificação de saúde
  private async performHealthCheck(): Promise<void> {
    try {
      const monitorStats = securityMonitor.getSecurityStats();
      const alertMetrics = intelligentAlerts.getMetrics();
      const rateLimitStats = {
        login: loginRateLimit.getStats(),
        api: apiRateLimit.getStats()
      };

      // Construir contexto para análise
      const context = {
        failedLogins: monitorStats.eventsByType.login_attempt || 0,
        xssAttempts: monitorStats.eventsByType.xss_attempt || 0,
        sqlInjectionAttempts: monitorStats.eventsByType.injection_attempt || 0,
        rateLimitViolations: rateLimitStats.login.blockedRequests + rateLimitStats.api.blockedRequests,
        suspiciousActivities: monitorStats.eventsByType.suspicious_activity || 0,
        systemErrors: monitorStats.eventsBySeverity.error || 0,
        totalSecurityEvents: monitorStats.totalEvents,
        unacknowledgedAlerts: alertMetrics.totalAlerts - alertMetrics.acknowledgedAlerts
      };

      // Processar contexto para alertas
      intelligentAlerts.processContext(context);

      // Log de saúde do sistema
      logger.info('🏥 Verificação de saúde do sistema concluída', {
        component: 'SECURITY_ORCHESTRATOR',
        ...context
      });

    } catch (error) {
      logger.error('Erro na verificação de saúde do sistema', error, {
        component: 'SECURITY_ORCHESTRATOR'
      });
    }
  }

  // Obter dashboard de segurança
  async getSecurityDashboard(): Promise<SecurityDashboard> {
    try {
      const auditResult = await securityAuditor.generateSecurityReport();
      const monitorStats = securityMonitor.getSecurityStats();
      const alertMetrics = intelligentAlerts.getMetrics();
      const rateLimitStats = {
        login: loginRateLimit.getStats(),
        api: apiRateLimit.getStats()
      };
      const validationStats = advancedInputValidation.getValidationStats();

      const criticalAlerts = alertMetrics.alertsBySeverity.critical || 0;
      const activeAlerts = alertMetrics.totalAlerts - alertMetrics.acknowledgedAlerts;

      // Determinar saúde geral do sistema
      let systemHealth: SecurityDashboard['systemHealth'] = 'excellent';
      
      if (auditResult.score < 70 || criticalAlerts > 0) {
        systemHealth = 'critical';
      } else if (auditResult.score < 85 || activeAlerts > 10) {
        systemHealth = 'warning';
      } else if (auditResult.score < 95 || activeAlerts > 5) {
        systemHealth = 'good';
      }

      return {
        auditScore: auditResult.score,
        monitoringStatus: 'active',
        activeAlerts,
        criticalAlerts,
        rateLimitStats: {
          loginBlocked: rateLimitStats.login.blockedRequests,
          apiBlocked: rateLimitStats.api.blockedRequests
        },
        validationStats: {
          totalRules: validationStats.totalRules,
          violationsToday: monitorStats.totalEvents // Simplificado para este exemplo
        },
        systemHealth,
        lastUpdate: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Erro ao gerar dashboard de segurança', error);
      
      return {
        auditScore: 0,
        monitoringStatus: 'error',
        activeAlerts: 0,
        criticalAlerts: 0,
        rateLimitStats: { loginBlocked: 0, apiBlocked: 0 },
        validationStats: { totalRules: 0, violationsToday: 0 },
        systemHealth: 'critical',
        lastUpdate: new Date().toISOString()
      };
    }
  }

  // Método conveniente para validação de entrada com monitoramento
  validateAndMonitor(
    input: string, 
    context: string, 
    userId?: string
  ): { isValid: boolean; sanitizedValue: string; violations: string[] } {
    const result = advancedInputValidation.validateInput(input, context, userId);
    
    // Se há violações, já foi monitorado automaticamente
    if (result.violations.length > 0) {
      logger.info('Entrada invalidada e monitorada', {
        component: 'SECURITY_ORCHESTRATOR',
        context,
        violationsCount: result.violations.length,
        severity: result.severity
      });
    }

    return result;
  }

  // Método conveniente para verificação de rate limit
  checkRateLimit(
    identifier: string, 
    action: 'login' | 'api' | 'password_reset' = 'api'
  ): { allowed: boolean; remaining: number; resetTime?: number } {
    let limiter;
    
    switch (action) {
      case 'login':
        limiter = loginRateLimit;
        break;
      case 'api':
        limiter = apiRateLimit;
        break;
      default:
        limiter = apiRateLimit;
    }

    const result = limiter.checkLimit(identifier, action);
    
    if (!result.allowed) {
      securityMonitor.monitorRateLimit(identifier, action, {
        blocked: true,
        resetTime: result.resetTime
      });
    }

    return result;
  }

  // Parar sistema de segurança
  shutdown(): void {
    if (!this.isInitialized) return;

    securityAuditor.stopContinuousAudit();
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.isInitialized = false;

    logger.info('🔒 Sistema de segurança avançado finalizado', {
      component: 'SECURITY_ORCHESTRATOR'
    });
  }

  // Método para situações de emergência
  async emergencyLockdown(reason: string): Promise<void> {
    logger.error('🚨 LOCKDOWN DE EMERGÊNCIA ATIVADO', {
      component: 'SECURITY_ORCHESTRATOR',
      reason
    });

    // Disparar alerta crítico
    intelligentAlerts.processContext({
      emergencyLockdown: true,
      reason,
      timestamp: new Date().toISOString()
    });

    // Aqui poderiam ser implementadas ações drásticas como:
    // - Invalidar todas as sessões
    // - Bloquear todas as APIs
    // - Notificar administradores via múltiplos canais
    // - Gerar logs de auditoria especiais
  }
}

export const securityOrchestrator = SecurityOrchestrator.getInstance();

// Auto-inicialização se não estiver em ambiente de teste
if (typeof window !== 'undefined' && !window.location.href.includes('test')) {
  securityOrchestrator.initialize().catch(error => {
    console.error('Falha na inicialização do sistema de segurança:', error);
  });
}
