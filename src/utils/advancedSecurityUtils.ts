
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

interface SecurityActivity {
  userId?: string;
  action: string;
  resource?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

interface SecurityAnalysis {
  userId: string;
  riskScore: number;
  behaviorPattern: 'normal' | 'suspicious' | 'critical';
  anomalies: string[];
  recommendations: string[];
}

/**
 * Utilitários avançados de segurança para Fase 3 RLS
 */
export const advancedSecurityUtils = {
  // Analisar comportamento do usuário
  async analyzeUserBehavior(userId: string): Promise<SecurityAnalysis | null> {
    try {
      const { data: activities, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // últimas 24h
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        logger.error('[SECURITY-UTILS] Erro ao analisar comportamento:', error);
        return null;
      }

      // Análise básica de padrões
      const totalActivities = activities?.length || 0;
      const securityViolations = activities?.filter(a => 
        a.event_type === 'security_violation' || a.severity === 'high'
      ).length || 0;

      const riskScore = Math.min(100, (securityViolations / Math.max(1, totalActivities)) * 100);
      
      let behaviorPattern: 'normal' | 'suspicious' | 'critical' = 'normal';
      const anomalies: string[] = [];
      const recommendations: string[] = [];

      if (securityViolations > 5) {
        behaviorPattern = 'critical';
        anomalies.push('Múltiplas violações de segurança detectadas');
        recommendations.push('Revisar permissões do usuário imediatamente');
      } else if (securityViolations > 2) {
        behaviorPattern = 'suspicious';
        anomalies.push('Atividade suspeita detectada');
        recommendations.push('Monitorar atividades do usuário');
      }

      if (totalActivities > 50) {
        anomalies.push('Alta frequência de atividades');
        recommendations.push('Verificar se atividades são legítimas');
      }

      return {
        userId,
        riskScore,
        behaviorPattern,
        anomalies,
        recommendations
      };
    } catch (error) {
      logger.error('[SECURITY-UTILS] Erro na análise comportamental:', error);
      return null;
    }
  },

  // Detectar padrões anômalos
  async detectAnomalies(): Promise<any[]> {
    try {
      const { data: recentLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // última hora
        .order('timestamp', { ascending: false });

      if (error) {
        logger.error('[SECURITY-UTILS] Erro ao detectar anomalias:', error);
        return [];
      }

      const anomalies = [];

      // Detectar picos de atividade
      const activitiesPerMinute: { [key: string]: number } = {};
      recentLogs?.forEach(log => {
        const minute = new Date(log.timestamp).toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
        activitiesPerMinute[minute] = (activitiesPerMinute[minute] || 0) + 1;
      });

      const avgActivities = Object.values(activitiesPerMinute).reduce((a, b) => a + b, 0) / Object.keys(activitiesPerMinute).length;
      
      Object.entries(activitiesPerMinute).forEach(([minute, count]) => {
        if (count > avgActivities * 3) {
          anomalies.push({
            type: 'activity_spike',
            timestamp: minute,
            value: count,
            threshold: avgActivities * 3,
            severity: 'medium'
          });
        }
      });

      return anomalies;
    } catch (error) {
      logger.error('[SECURITY-UTILS] Erro na detecção de anomalias:', error);
      return [];
    }
  },

  // Validar integridade do sistema RLS
  async validateRLSIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const { data: summary, error } = await supabase.rpc('get_rls_security_summary');

      if (error) {
        logger.error('[SECURITY-UTILS] Erro na validação RLS:', error);
        return {
          isValid: false,
          issues: ['Erro ao acessar dados de segurança'],
          recommendations: ['Verificar conectividade com banco de dados']
        };
      }

      const issues: string[] = [];
      const recommendations: string[] = [];

      if (summary.critical_tables > 0) {
        issues.push(`${summary.critical_tables} tabelas sem proteção RLS`);
        recommendations.push('Implementar políticas RLS nas tabelas vulneráveis');
      }

      if (summary.rls_disabled_tables > 0) {
        issues.push(`${summary.rls_disabled_tables} tabelas com RLS desabilitado`);
        recommendations.push('Habilitar RLS nas tabelas com políticas inativas');
      }

      if (summary.security_percentage < 100) {
        issues.push('Cobertura RLS incompleta');
        recommendations.push('Executar migração de correção RLS');
      }

      return {
        isValid: summary.security_percentage === 100,
        issues,
        recommendations
      };
    } catch (error) {
      logger.error('[SECURITY-UTILS] Erro na validação de integridade:', error);
      return {
        isValid: false,
        issues: ['Erro interno na validação'],
        recommendations: ['Verificar logs do sistema']
      };
    }
  }
};

/**
 * Registrar atividade de segurança
 */
export const logSecurityActivity = async (activity: SecurityActivity): Promise<void> => {
  try {
    await supabase.rpc('log_security_access', {
      p_table_name: activity.resource || 'system',
      p_operation: activity.action,
      p_resource_id: activity.userId
    });

    logger.info('[SECURITY-ACTIVITY] Atividade registrada:', {
      action: activity.action,
      resource: activity.resource,
      timestamp: activity.timestamp
    });
  } catch (error) {
    logger.error('[SECURITY-ACTIVITY] Erro ao registrar atividade:', error);
  }
};

/**
 * Gerar relatório de segurança
 */
export const generateSecurityReport = async (): Promise<{
  summary: any;
  anomalies: any[];
  recommendations: string[];
  timestamp: string;
}> => {
  try {
    const [summary, anomalies, integrity] = await Promise.all([
      supabase.rpc('get_rls_security_summary'),
      advancedSecurityUtils.detectAnomalies(),
      advancedSecurityUtils.validateRLSIntegrity()
    ]);

    return {
      summary: summary.data,
      anomalies,
      recommendations: integrity.recommendations,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('[SECURITY-REPORT] Erro ao gerar relatório:', error);
    throw error;
  }
};
