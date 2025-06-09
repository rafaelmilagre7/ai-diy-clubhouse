
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
      
      // Tentar salvar no banco (se conectado)
      try {
        await supabase.from('audit_logs').insert(auditEntry);
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
      // Em produção, usar serviço real de IP
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
      
      // Manter apenas últimos 100 registros
      const limited = existing.slice(-100);
      localStorage.setItem('audit_logs_fallback', JSON.stringify(limited));
    } catch {
      // Falhar silenciosamente se não conseguir salvar
    }
  }
  
  // Métodos específicos para diferentes tipos de eventos
  async logAuthEvent(action: string, details: Record<string, any> = {}, userId?: string): Promise<void> {
    await this.logAuditEvent('AUTH', action, details, userId);
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
  
  // Estatísticas de auditoria
  async getAuditStats(): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    recentEvents: number;
  }> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const logs = await this.getAuditLogs(1000);
      
      const eventsByType: Record<string, number> = {};
      let recentEvents = 0;
      
      logs.forEach(log => {
        const eventType = log.event_type || 'unknown';
        eventsByType[eventType] = (eventsByType[eventType] || 0) + 1;
        
        if (new Date(log.timestamp) > oneDayAgo) {
          recentEvents++;
        }
      });
      
      return {
        totalEvents: logs.length,
        eventsByType,
        recentEvents
      };
    } catch {
      return {
        totalEvents: 0,
        eventsByType: {},
        recentEvents: 0
      };
    }
  }
}

// Instância global
export const auditLogger = AuditLogger.getInstance();
