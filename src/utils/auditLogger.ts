
import { supabase } from '@/lib/supabase';
import { sanitizeForLogging } from './securityUtils';
import { logger } from './logger';

// Sistema de auditoria robusto para ações críticas
export class AuditLogger {
  private static instance: AuditLogger;
  private retryQueue: Array<{ entry: any; retries: number }> = [];
  private maxRetries = 3;
  private isProcessingQueue = false;
  
  private constructor() {
    // Processar fila de retry a cada 30 segundos
    setInterval(() => this.processRetryQueue(), 30000);
  }
  
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
    'logout', 'session_start', 'session_end', 'session_active',
    'page_view', 'solution_start', 'solution_complete',
    'security_warning', 'error_logged'
  ];
  
  // Log de evento de auditoria principal
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
        user_agent: this.sanitizeUserAgent(navigator.userAgent),
        session_id: await this.getSessionId()
      };
      
      // Tentar salvar no banco principal
      const success = await this.saveToDatabase(auditEntry);
      
      if (!success) {
        // Adicionar à fila de retry
        this.retryQueue.push({
          entry: auditEntry,
          retries: 0
        });
        
        // Fallback para localStorage apenas em caso de falha
        this.saveToLocalStorage(auditEntry);
      }
      
      logger.info("Evento de auditoria registrado", {
        component: 'AUDIT_LOGGER',
        eventType,
        action,
        saved: success ? 'database' : 'fallback'
      });
      
    } catch (error) {
      logger.error("Erro crítico no sistema de auditoria", {
        component: 'AUDIT_LOGGER',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
  
  // Salvar no banco de dados com tratamento robusto de erros
  private async saveToDatabase(auditEntry: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert(auditEntry);
      
      if (error) {
        logger.warn("Erro ao salvar audit log no banco", {
          component: 'AUDIT_LOGGER',
          error: error.message
        });
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error("Falha na conexão com banco para audit", {
        component: 'AUDIT_LOGGER',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return false;
    }
  }
  
  // Processar fila de retry
  private async processRetryQueue(): Promise<void> {
    if (this.isProcessingQueue || this.retryQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    try {
      const toRetry = [...this.retryQueue];
      this.retryQueue = [];
      
      for (const item of toRetry) {
        if (item.retries < this.maxRetries) {
          const success = await this.saveToDatabase(item.entry);
          
          if (!success) {
            item.retries++;
            this.retryQueue.push(item);
          } else {
            logger.info("Audit log recuperado da fila", {
              component: 'AUDIT_LOGGER',
              retries: item.retries
            });
          }
        } else {
          logger.warn("Audit log descartado após max retries", {
            component: 'AUDIT_LOGGER',
            action: item.entry.action
          });
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }
  
  // Sanitizar User Agent
  private sanitizeUserAgent(userAgent: string): string {
    return userAgent.substring(0, 255).replace(/[<>'"]/g, '');
  }
  
  // Obter IP do cliente de forma segura
  private async getClientIP(): Promise<string> {
    try {
      if (process.env.NODE_ENV === 'production') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch('https://api.ipify.org?format=json', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          return data.ip || 'unknown';
        }
      }
      return 'localhost';
    } catch {
      return 'unknown';
    }
  }
  
  // Obter ID da sessão de forma segura
  private async getSessionId(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token?.substring(0, 16) + '***' || null;
    } catch {
      return null;
    }
  }
  
  // Salvar no localStorage como último recurso
  private saveToLocalStorage(auditEntry: any): void {
    try {
      const existing = JSON.parse(localStorage.getItem('audit_logs_fallback') || '[]');
      existing.push({
        ...auditEntry,
        fallback: true,
        fallback_timestamp: new Date().toISOString()
      });
      
      // Manter apenas últimos 25 registros para não sobrecarregar
      const limited = existing.slice(-25);
      localStorage.setItem('audit_logs_fallback', JSON.stringify(limited));
    } catch {
      // Falhar silenciosamente se não conseguir salvar
    }
  }
  
  // Log para analytics apenas de eventos válidos
  private async logToAnalytics(eventType: string, details: Record<string, any>, userId?: string): Promise<void> {
    if (!userId || !this.validAnalyticsEvents.includes(eventType)) {
      return;
    }
    
    try {
      const { error } = await supabase.from('analytics').insert({
        user_id: userId,
        event_type: eventType,
        solution_id: details.solution_id || null,
        module_id: details.module_id || null,
        event_data: sanitizeForLogging(details)
      });
      
      if (error) {
        logger.warn("Erro ao salvar analytics", {
          component: 'AUDIT_LOGGER',
          error: error.message
        });
      }
    } catch (error) {
      // Falhar silenciosamente para não quebrar o fluxo
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
  
  async logSecurityEvent(action: string, severity: 'low' | 'medium' | 'high' | 'critical', details: Record<string, any> = {}): Promise<void> {
    await this.logAuditEvent('SECURITY', action, { ...details, severity });
    
    // Log para analytics apenas em casos críticos ou de alto risco
    if (['critical', 'high'].includes(severity)) {
      await this.logToAnalytics('security_warning', { severity, action, ...details });
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
  
  async logSystemEvent(action: string, details: Record<string, any> = {}): Promise<void> {
    await this.logAuditEvent('SYSTEM', action, details);
  }
  
  // Obter logs de auditoria para dashboard admin
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
        .limit(Math.min(limit, 100)); // Máximo 100 por segurança
      
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
      
      // Fallback para logs locais se necessário
      try {
        const localLogs = JSON.parse(localStorage.getItem('audit_logs_fallback') || '[]');
        return localLogs.slice(0, limit);
      } catch {
        return [];
      }
    }
  }
  
  // Limpar logs antigos (para ser chamado periodicamente)
  async cleanupOldLogs(daysToKeep: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());
      
      if (error) {
        logger.warn("Erro na limpeza de logs antigos", {
          component: 'AUDIT_LOGGER',
          error: error.message
        });
      } else {
        logger.info("Limpeza de logs antigos concluída", {
          component: 'AUDIT_LOGGER',
          cutoffDate: cutoffDate.toISOString()
        });
      }
    } catch (error) {
      logger.error("Falha na limpeza de logs", {
        component: 'AUDIT_LOGGER',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}

// Instância global
export const auditLogger = AuditLogger.getInstance();
