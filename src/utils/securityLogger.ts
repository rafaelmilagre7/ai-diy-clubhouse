import { supabase } from '@/lib/supabase';
import { logger } from './logger';

/**
 * Utilitário consolidado para logging de segurança
 * Conecta com a função log_security_access criada no banco
 */
export class SecurityLogger {
  private static instance: SecurityLogger;
  
  public static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  /**
   * Registra acesso a dados usando a função segura do banco
   */
  async logDataAccess(
    tableName: string,
    operation: string,
    resourceId?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('log_security_access', {
        p_table_name: tableName,
        p_operation: operation,
        p_resource_id: resourceId
      });

      if (error) {
        logger.error('[SECURITY] Erro ao registrar acesso a dados:', error);
      } else {
        logger.debug('[SECURITY] Acesso registrado com sucesso', {
          table: tableName,
          operation,
          resourceId
        });
      }
    } catch (error) {
      logger.error('[SECURITY] Erro crítico no logging de segurança:', error);
    }
  }

  /**
   * Registra violação de segurança
   */
  async logSecurityViolation(
    violationType: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      await this.logDataAccess('security_violations', violationType, JSON.stringify(details));
      
      logger.warn('[SECURITY] Violação de segurança detectada', {
        type: violationType,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('[SECURITY] Erro ao registrar violação:', error);
    }
  }

  /**
   * Registra tentativa de acesso não autorizado
   */
  async logUnauthorizedAccess(
    resource: string,
    attemptedAction: string,
    context: Record<string, any> = {}
  ): Promise<void> {
    await this.logSecurityViolation('unauthorized_access', {
      resource,
      attemptedAction,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
}

// Instância singleton exportada
export const securityLogger = SecurityLogger.getInstance();