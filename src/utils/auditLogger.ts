
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Sistema de logging de auditoria seguro que não bloqueia operações principais
 */

type AuditEventType = 
  | 'auth'
  | 'authentication' 
  | 'user_registration'
  | 'invite_process'
  | 'invite_validation'
  | 'invite_acceptance'
  | 'invite_registration'
  | 'data_access'
  | 'system_event'
  | 'security_event'
  | 'user_action'
  | 'admin_action';

interface AuditLogData {
  action: string;
  resource_id?: string;
  details?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

class AuditLogger {
  private async safeLog(
    eventType: AuditEventType,
    data: AuditLogData,
    userId?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('safe_audit_log', {
        p_event_type: eventType,
        p_action: data.action,
        p_resource_id: data.resource_id || null,
        p_details: data.details ? JSON.stringify(data.details) : null,
        p_severity: data.severity || 'info'
      });

      if (error) {
        logger.warn('Erro ao criar log de auditoria (não crítico):', {
          component: 'AUDIT_LOGGER',
          error: error.message,
          eventType,
          action: data.action
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.warn('Erro inesperado ao criar log de auditoria:', {
        component: 'AUDIT_LOGGER',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        eventType,
        action: data.action
      });
      return false;
    }
  }

  // Logs de autenticação
  async logAuthEvent(action: string, details?: Record<string, any>, userId?: string) {
    return this.safeLog('authentication', { action, details }, userId);
  }

  // Logs de registro de usuário
  async logUserRegistration(action: string, details?: Record<string, any>, userId?: string) {
    return this.safeLog('user_registration', { action, details }, userId);
  }

  // Logs de processo de convite
  async logInviteProcess(action: string, resourceId?: string, details?: Record<string, any>) {
    return this.safeLog('invite_process', { action, resource_id: resourceId, details });
  }

  // Logs de sistema
  async logSystemEvent(action: string, details?: Record<string, any>) {
    return this.safeLog('system_event', { action, details });
  }

  // Logs de segurança
  async logSecurityEvent(action: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium', details?: Record<string, any>) {
    return this.safeLog('security_event', { action, details, severity });
  }

  // Logs de ações do usuário
  async logUserAction(action: string, resourceId?: string, details?: Record<string, any>, userId?: string) {
    return this.safeLog('user_action', { action, resource_id: resourceId, details }, userId);
  }

  // Logs de ações administrativas
  async logAdminAction(action: string, resourceId?: string, details?: Record<string, any>, userId?: string) {
    return this.safeLog('admin_action', { action, resource_id: resourceId, details }, userId);
  }

  // Logs de acesso a dados - método adicionado para compatibilidade
  async logAccessEvent(action: string, resourceId?: string, details?: Record<string, any>, userId?: string) {
    return this.safeLog('data_access', { action, resource_id: resourceId, details }, userId);
  }

  // Logs de eventos de dados - método adicionado para compatibilidade
  async logDataEvent(action: string, resourceType: string, resourceId?: string, details?: Record<string, any>, userId?: string) {
    return this.safeLog('data_access', { 
      action: `${action}_${resourceType}`, 
      resource_id: resourceId, 
      details 
    }, userId);
  }
}

export const auditLogger = new AuditLogger();
