
import { supabase } from '@/lib/supabase';
import { sanitizeForLogging } from './securityUtils';
import { logger } from './logger';

// Sistema de auditoria para ações críticas
export class AuditLogger {
  private static instance: AuditLogger;
  
  private constructor() {}
  
  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }
  
  // Tipos de eventos auditáveis
  private eventTypes = {
    AUTH: 'authentication',
    ACCESS: 'access_control', 
    DATA: 'data_modification',
    ADMIN: 'admin_action',
    SECURITY: 'security_event',
    SYSTEM: 'system_event'
  } as const;
  
  // Lista de eventos válidos para analytics
  private validAnalyticsEvents = [
    'login_attempt', 'login_success', 'login_failure',
    'logout', 'session_start', 'session_end',
    'page_view', 'solution_start', 'solution_complete',
    'security_warning', 'error_logged'
  ];
  
  // Log de evento de auditoria
  async logAuditEvent(
    eventType: keyof typeof this.eventTypes,
    action: string,
    details: Record<string, any> = {},
    userId?: string,
    resourceId?: string
  ): Promise<void> {
    try {
      const auditEntry = {
        event_type: this.eventTypes[eventType],
        action,
        user_id: userId || null,
        resource_id: resourceId || null,
        details: sanitizeForLogging(details),
        timestamp: new Date().toISOString(),
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent.substring(0, 255),
        session_id: await this.getSessionId()
      };
      
      // Tentar salvar no banco (se conectado) com fallback
      try {
        // Apenas inserir se temos user_id válido
        if (userId) {
          await supabase.from('audit_logs').insert(auditEntry);
        }
        
        logger.info("Evento de auditoria registrado", {
          component: 'AUDIT_LOGGER',
          eventType,
          action
        });
      } catch (dbError) {
        // Fallback para localStorage se banco não disponível
        this.saveToLocalStorage(auditEntry);
        logger.warn("Auditoria salva localmente (banco indisponível)", {
          component: 'AUDIT_LOGGER',
          error: dbError instanceof Error ? dbError.message : 'Erro desconhecido'
        });
      }
      
    } catch (error) {
      logger.error("Erro no sistema de auditoria", {
        component: 'AUDIT_LOGGER',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
  
  // Obter IP do cliente (simulado)
  private async getClientIP(): Promise<string> {
    try {
      if (process.env.NODE_ENV === 'production') {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'unknown';
      }
      return 'localhost';
    } catch {
      return 'unknown';
    }
  }
  
  // Obter ID da sessão
  private async getSessionId(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token?.substring(0, 16) + '***' || null;
    } catch {
      return null;
    }
  }
  
  // Salvar auditoria no localStorage como fallback
  private saveToLocalStorage(auditEntry: any): void {
    try {
      const existing = JSON.parse(localStorage.getItem('audit_logs_fallback') || '[]');
      existing.push(auditEntry);
      
      // Manter apenas últimos 50 registros para não sobrecarregar
      const limited = existing.slice(-50);
      localStorage.setItem('audit_logs_fallback', JSON.stringify(limited));
    } catch {
      // Falhar silenciosamente se não conseguir salvar
    }
  }
  
  // Log seguro para analytics - apenas eventos válidos
  private async logToAnalytics(eventType: string, details: Record<string, any>, userId?: string): Promise<void> {
    if (!userId || !this.validAnalyticsEvents.includes(eventType)) {
      return; // Não logar se não tem usuário ou evento inválido
    }
    
    try {
      await supabase.from('analytics').insert({
        user_id: userId,
        event_type: eventType,
        solution_id: details.solution_id || null,
        module_id: details.module_id || null,
        event_data: sanitizeForLogging(details)
      });
    } catch (error) {
      // Falhar silenciosamente para não quebrar o fluxo
      console.warn('Erro ao salvar analytics:', error);
    }
  }
  
  // Métodos específicos para diferentes tipos de eventos
  async logAuthEvent(action: string, details: Record<string, any> = {}, userId?: string): Promise<void> {
    await this.logAuditEvent('AUTH', action, details, userId);
    
    // Log específico para analytics se for evento válido
    const analyticsEvent = action.includes('login') ? 'login_attempt' : 
                          action.includes('logout') ? 'logout' :
                          action.includes('session') ? 'session_start' : null;
    
    if (analyticsEvent && userId) {
      await this.logToAnalytics(analyticsEvent, details, userId);
    }
  }
  
  async logAccessEvent(action: string, resource: string, details: Record<string, any> = {}, userId?: string): Promise<void> {
    await this.logAuditEvent('ACCESS', action, { ...details, resource }, userId, resource);
  }
  
  async logDataEvent(action: string, table: string, recordId?: string, details: Record<string, any> = {}, userId?: string): Promise<void> {
    await this.logAuditEvent('DATA', action, { ...details, table }, userId, recordId);
  }
  
  async logAdminEvent(action: string, details: Record<string, any> = {}, userId?: string): Promise<void> {
    await this.logAuditEvent('ADMIN', action, details, userId);
  }
  
  async logSecurityEvent(action: string, severity: 'low' | 'medium' | 'high' | 'critical', details: Record<string, any> = {}): Promise<void> {
    await this.logAuditEvent('SECURITY', action, { ...details, severity });
    
    // Log para analytics apenas em casos críticos
    if (severity === 'critical') {
      await this.logToAnalytics('security_warning', { severity, action, ...details });
    }
  }
  
  async logSystemEvent(action: string, details: Record<string, any> = {}): Promise<void> {
    await this.logAuditEvent('SYSTEM', action, details);
  }
  
  // Obter logs de auditoria (para dashboard admin)
  async getAuditLogs(
    limit: number = 50,
    eventType?: string,
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (eventType) {
        query = query.eq('event_type', eventType);
      }
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      logger.error("Erro ao buscar logs de auditoria", {
        component: 'AUDIT_LOGGER',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      // Fallback para logs locais
      try {
        return JSON.parse(localStorage.getItem('audit_logs_fallback') || '[]');
      } catch {
        return [];
      }
    }
  }
}

// Instância global
export const auditLogger = AuditLogger.getInstance();
