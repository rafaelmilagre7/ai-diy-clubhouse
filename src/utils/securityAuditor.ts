
import { logger } from './logger';
import { supabase } from '@/lib/supabase';

interface SecurityAuditResult {
  isSecure: boolean;
  issues: string[];
  recommendations: string[];
  score: number;
  timestamp: string;
}

interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivities: number;
  rateLimitHits: number;
  xssAttempts: number;
  sqlInjectionAttempts: number;
}

class SecurityAuditor {
  private static instance: SecurityAuditor;
  private auditInterval: NodeJS.Timeout | null = null;
  private readonly AUDIT_INTERVAL = 10 * 60 * 1000; // 10 minutos

  private constructor() {}

  static getInstance(): SecurityAuditor {
    if (!SecurityAuditor.instance) {
      SecurityAuditor.instance = new SecurityAuditor();
    }
    return SecurityAuditor.instance;
  }

  // Iniciar auditoria contínua
  startContinuousAudit(): void {
    if (this.auditInterval) return;
    
    this.auditInterval = setInterval(() => {
      this.performSecurityAudit();
    }, this.AUDIT_INTERVAL);

    logger.info('Auditoria contínua de segurança iniciada', {
      component: 'SECURITY_AUDITOR',
      interval: this.AUDIT_INTERVAL / 1000 / 60 + ' minutos'
    });
  }

  // Parar auditoria contínua
  stopContinuousAudit(): void {
    if (this.auditInterval) {
      clearInterval(this.auditInterval);
      this.auditInterval = null;
      logger.info('Auditoria contínua de segurança parada', {
        component: 'SECURITY_AUDITOR'
      });
    }
  }

  // Realizar auditoria completa
  async performSecurityAudit(): Promise<SecurityAuditResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    try {
      // Verificar métricas de segurança
      const metrics = await this.getSecurityMetrics();
      
      // Analisar tentativas de login falhadas
      if (metrics.failedLogins > 50) {
        issues.push('Alto número de tentativas de login falhadas');
        recommendations.push('Revisar logs de autenticação e considerar bloqueios por IP');
        score -= 15;
      }

      // Analisar atividades suspeitas
      if (metrics.suspiciousActivities > 10) {
        issues.push('Atividades suspeitas detectadas');
        recommendations.push('Investigar padrões de acesso anômalos');
        score -= 20;
      }

      // Analisar ataques XSS
      if (metrics.xssAttempts > 0) {
        issues.push('Tentativas de XSS detectadas');
        recommendations.push('Reforçar validação de entrada e CSP');
        score -= 25;
      }

      // Verificar integridade do sistema
      const systemIntegrity = await this.checkSystemIntegrity();
      if (!systemIntegrity.isValid) {
        issues.push('Problemas de integridade detectados');
        recommendations.push('Verificar configurações de segurança');
        score -= 30;
      }

      const result: SecurityAuditResult = {
        isSecure: score >= 80,
        issues,
        recommendations,
        score: Math.max(0, score),
        timestamp: new Date().toISOString()
      };

      // Log do resultado
      logger.info('Auditoria de segurança concluída', {
        component: 'SECURITY_AUDITOR',
        score: result.score,
        issuesCount: issues.length,
        isSecure: result.isSecure
      });

      // Alertar se score baixo
      if (score < 70) {
        await this.triggerSecurityAlert(result);
      }

      return result;
    } catch (error) {
      logger.error('Erro na auditoria de segurança', error, {
        component: 'SECURITY_AUDITOR'
      });
      
      return {
        isSecure: false,
        issues: ['Erro na execução da auditoria'],
        recommendations: ['Verificar logs do sistema'],
        score: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Obter métricas de segurança
  private async getSecurityMetrics(): Promise<SecurityMetrics> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    try {
      // Buscar dados de auditoria da última hora
      const { data: auditData } = await supabase
        .from('audit_logs')
        .select('action, details')
        .gte('timestamp', oneHourAgo.toISOString());

      const metrics: SecurityMetrics = {
        failedLogins: 0,
        suspiciousActivities: 0,
        rateLimitHits: 0,
        xssAttempts: 0,
        sqlInjectionAttempts: 0
      };

      auditData?.forEach(log => {
        switch (log.action) {
          case 'login_failed':
            metrics.failedLogins++;
            break;
          case 'suspicious_activity':
            metrics.suspiciousActivities++;
            break;
          case 'rate_limit_hit':
            metrics.rateLimitHits++;
            break;
          case 'xss_attempt':
            metrics.xssAttempts++;
            break;
          case 'sql_injection_attempt':
            metrics.sqlInjectionAttempts++;
            break;
        }
      });

      return metrics;
    } catch (error) {
      logger.error('Erro ao obter métricas de segurança', error);
      return {
        failedLogins: 0,
        suspiciousActivities: 0,
        rateLimitHits: 0,
        xssAttempts: 0,
        sqlInjectionAttempts: 0
      };
    }
  }

  // Verificar integridade do sistema
  private async checkSystemIntegrity(): Promise<{ isValid: boolean; details: string[] }> {
    const details: string[] = [];
    let isValid = true;

    // Verificar se as variáveis de ambiente críticas estão presentes
    const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    
    requiredEnvVars.forEach(envVar => {
      if (!import.meta.env[envVar]) {
        details.push(`Variável de ambiente ${envVar} não configurada`);
        isValid = false;
      }
    });

    // Verificar se estamos em produção com HTTPS
    if (import.meta.env.PROD && window.location.protocol !== 'https:') {
      details.push('Aplicação em produção sem HTTPS');
      isValid = false;
    }

    return { isValid, details };
  }

  // Disparar alerta de segurança
  private async triggerSecurityAlert(auditResult: SecurityAuditResult): Promise<void> {
    try {
      logger.warn('🚨 ALERTA DE SEGURANÇA - Score baixo detectado', {
        component: 'SECURITY_AUDITOR',
        score: auditResult.score,
        issues: auditResult.issues,
        recommendations: auditResult.recommendations
      });

      // Registrar no log de auditoria
      await supabase.from('audit_logs').insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Sistema
        event_type: 'security_alert',
        action: 'low_security_score',
        details: {
          score: auditResult.score,
          issues: auditResult.issues,
          recommendations: auditResult.recommendations,
          timestamp: auditResult.timestamp
        },
        severity: 'high'
      });

    } catch (error) {
      logger.error('Erro ao disparar alerta de segurança', error);
    }
  }

  // Gerar relatório de segurança
  async generateSecurityReport(): Promise<SecurityAuditResult> {
    return await this.performSecurityAudit();
  }
}

export const securityAuditor = SecurityAuditor.getInstance();

// Auto-inicializar em desenvolvimento
if (import.meta.env.DEV) {
  securityAuditor.startContinuousAudit();
}
