
import { supabase } from '@/lib/supabase';
import { logger } from './logger';

// Sistema de auditoria de logs seguros
export class AuditLogger {
  private static instance: AuditLogger;
  
  private constructor() {}
  
  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  // Log de eventos de autenticação
  async logAuthEvent(
    action: string, 
    details: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      await this.insertAuditLog({
        event_type: 'authentication',
        action,
        user_id: userId || null,
        details: this.sanitizeDetails(details),
        severity: this.determineSeverity('authentication', action)
      });
    } catch (error) {
      logger.error("Erro ao registrar evento de autenticação", {
        component: 'AUDIT_LOGGER',
        action,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Log de eventos de segurança
  async logSecurityEvent(
    action: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      await this.insertAuditLog({
        event_type: 'security_event',
        action,
        user_id: userId || null,
        details: this.sanitizeDetails(details),
        severity
      });
    } catch (error) {
      logger.error("Erro ao registrar evento de segurança", {
        component: 'AUDIT_LOGGER',
        action,
        severity,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Log de eventos de acesso
  async logAccessEvent(
    action: string,
    resource: string,
    details: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      await this.insertAuditLog({
        event_type: 'access_control',
        action,
        user_id: userId || null,
        resource_id: resource,
        details: this.sanitizeDetails(details),
        severity: 'low'
      });
    } catch (error) {
      logger.error("Erro ao registrar evento de acesso", {
        component: 'AUDIT_LOGGER',
        action,
        resource,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Log de modificações de dados
  async logDataEvent(
    action: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      await this.insertAuditLog({
        event_type: 'data_modification',
        action,
        user_id: userId || null,
        resource_id: resourceId,
        details: {
          ...this.sanitizeDetails(details),
          resource_type: resourceType
        },
        severity: this.determineSeverity('data_modification', action)
      });
    } catch (error) {
      logger.error("Erro ao registrar evento de dados", {
        component: 'AUDIT_LOGGER',
        action,
        resourceType,
        resourceId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Log de ações administrativas
  async logAdminEvent(
    action: string,
    details: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      await this.insertAuditLog({
        event_type: 'admin_action',
        action,
        user_id: userId || null,
        details: this.sanitizeDetails(details),
        severity: 'medium'
      });
    } catch (error) {
      logger.error("Erro ao registrar evento administrativo", {
        component: 'AUDIT_LOGGER',
        action,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Inserir log de auditoria no banco
  private async insertAuditLog(logData: {
    event_type: string;
    action: string;
    user_id: string | null;
    resource_id?: string;
    details: Record<string, any>;
    severity: string;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          ...logData,
          ip_address: this.getClientIP(),
          user_agent: this.getUserAgent(),
          session_id: this.getSessionId()
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      // Log local se falhar no banco
      logger.error("Falha ao inserir log de auditoria", {
        component: 'AUDIT_LOGGER',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        logData
      });
    }
  }

  // Sanitizar detalhes para remover informações sensíveis
  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'auth', 'credential',
      'email', 'phone', 'cpf', 'rg', 'api_key', 'access_token',
      'refresh_token', 'session_id'
    ];

    const sanitized = { ...details };

    const sanitizeValue = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeValue(item));
      }

      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const keyLower = key.toLowerCase();
        
        if (sensitiveFields.some(field => keyLower.includes(field))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          result[key] = sanitizeValue(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    return sanitizeValue(sanitized);
  }

  // Determinar severidade baseada no tipo e ação
  private determineSeverity(eventType: string, action: string): string {
    const highRiskActions = ['login_failure', 'permission_denied', 'injection_attempt', 'rate_limit_exceeded'];
    const mediumRiskActions = ['login_success', 'permission_change', 'data_delete'];
    
    if (highRiskActions.some(risk => action.includes(risk))) {
      return 'high';
    }
    
    if (mediumRiskActions.some(risk => action.includes(risk))) {
      return 'medium';
    }
    
    return 'low';
  }

  // Obter IP do cliente (simulado)
  private getClientIP(): string {
    return 'hidden_for_privacy';
  }

  // Obter user agent
  private getUserAgent(): string {
    return typeof window !== 'undefined' ? 
      window.navigator.userAgent.substring(0, 200) : 
      'server';
  }

  // Obter ID da sessão
  private getSessionId(): string {
    try {
      const sessionData = localStorage.getItem('supabase.auth.token');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        return parsed.access_token?.substring(0, 16) + '***' || 'unknown';
      }
    } catch {
      // Ignorar erro
    }
    return 'unknown';
  }

  // Buscar logs (apenas para admins)
  async getLogs(filters: {
    eventType?: string;
    severity?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error("Erro ao buscar logs de auditoria", {
        component: 'AUDIT_LOGGER',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        filters
      });
      return [];
    }
  }
}

// Instância global
export const auditLogger = AuditLogger.getInstance();
