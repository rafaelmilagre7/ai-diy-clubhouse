
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { securityLogger } from '@/utils/securityLogger';
import { logger } from '@/utils/logger';

/**
 * Hook para forçar verificações de segurança e logs de auditoria
 * FASE 3: Integrado com sistema avançado de segurança
 */
export const useSecurityEnforcement = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      // Log de tentativa de acesso não autorizado
      securityLogger.logUnauthorizedAccess(
        window.location.pathname,
        'page_access',
        {
          url: window.location.href,
          referrer: document.referrer
        }
      );

      logger.warn('[SECURITY] Tentativa de acesso sem autenticação detectada', {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        component: 'useSecurityEnforcement'
      });
    }
  }, [user, isLoading]);

  // Função aprimorada para logar acessos a dados
  const logDataAccess = async (tableName: string, operation: string, resourceId?: string) => {
    if (!user) return;

    try {
      await securityLogger.logDataAccess(tableName, operation, resourceId);

      logger.debug('[SECURITY] Acesso a dados registrado', { 
        tableName, 
        operation, 
        resourceId,
        userId: user.id.substring(0, 8) + '***'
      });
    } catch (error) {
      logger.error('[SECURITY] Erro ao registrar acesso a dados:', error);
    }
  };

  // Função aprimorada para verificar permissões
  const enforceUserDataAccess = async (dataUserId: string, operation: string = 'read') => {
    if (!user) {
      await securityLogger.logUnauthorizedAccess(
        'user_data',
        'data_access_attempt',
        { operation, dataUserId }
      );

      logger.error('[SECURITY] Tentativa de acesso a dados sem autenticação', {
        operation,
        dataUserId,
        component: 'useSecurityEnforcement'
      });
      throw new Error('Acesso negado: usuário não autenticado');
    }

    if (user.id !== dataUserId) {
      await securityLogger.logSecurityViolation('cross_user_data_access', {
        currentUserId: user.id,
        targetUserId: dataUserId,
        operation
      });

      logger.error('[SECURITY] Tentativa de acesso a dados de outro usuário', {
        currentUserId: user.id,
        targetUserId: dataUserId,
        operation,
        component: 'useSecurityEnforcement'
      });
      throw new Error('Acesso negado: dados de outro usuário');
    }

    // Log de acesso autorizado
    await securityLogger.logDataAccess('user_data', `authorized_${operation}`, dataUserId);
  };

  // Nova função para reportar evento de segurança
  const reportSecurityEvent = async (eventType: string, details: Record<string, any> = {}) => {
    if (!user) return;

    await securityLogger.logSecurityViolation(eventType, {
      ...details,
      userId: user.id,
      timestamp: new Date().toISOString()
    });

    logger.info('[SECURITY] Evento de segurança reportado', {
      eventType,
      details,
      userId: user.id.substring(0, 8) + '***'
    });
  };

  return {
    logDataAccess,
    enforceUserDataAccess,
    reportSecurityEvent,
    isAuthenticated: !!user
  };
};
