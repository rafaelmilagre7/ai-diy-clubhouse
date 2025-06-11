
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { advancedSecurityUtils, logSecurityActivity } from '@/utils/advancedSecurityUtils';
import { logger } from '@/utils/logger';

/**
 * Hook para forçar verificações de segurança e logs de auditoria
 * FASE 3: Integrado com sistema avançado de segurança
 */
export const useSecurityEnforcement = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      // Log de tentativa de acesso não autorizado com sistema avançado
      logSecurityActivity({
        action: 'unauthorized_access_attempt',
        timestamp: new Date().toISOString(),
        ipAddress: undefined, // Será preenchido pelo sistema
        userAgent: navigator.userAgent,
        resource: window.location.pathname
      });

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
      // Log através do sistema avançado
      await logSecurityActivity({
        userId: user.id,
        action: `data_${operation}`,
        resource: tableName,
        timestamp: new Date().toISOString(),
        ipAddress: undefined, // Será detectado automaticamente
        userAgent: navigator.userAgent
      });

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
      await logSecurityActivity({
        action: 'unauthorized_data_access_attempt',
        resource: 'user_data',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });

      logger.error('[SECURITY] Tentativa de acesso a dados sem autenticação', {
        operation,
        dataUserId,
        component: 'useSecurityEnforcement'
      });
      throw new Error('Acesso negado: usuário não autenticado');
    }

    if (user.id !== dataUserId) {
      await logSecurityActivity({
        userId: user.id,
        action: 'cross_user_data_access_attempt',
        resource: 'user_data',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
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
    await logSecurityActivity({
      userId: user.id,
      action: `authorized_${operation}`,
      resource: 'user_data',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  };

  // Nova função para análise comportamental
  const analyzeUserBehavior = async () => {
    if (!user) return null;

    try {
      return await advancedSecurityUtils.analyzeUserBehavior(user.id);
    } catch (error) {
      logger.error('[SECURITY] Erro na análise comportamental:', error);
      return null;
    }
  };

  // Nova função para reportar evento de segurança
  const reportSecurityEvent = async (eventType: string, details: Record<string, any> = {}) => {
    if (!user) return;

    await logSecurityActivity({
      userId: user.id,
      action: eventType,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      resource: details.resource
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
    analyzeUserBehavior,
    reportSecurityEvent,
    isAuthenticated: !!user
  };
};
