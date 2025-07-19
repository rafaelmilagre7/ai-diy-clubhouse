
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Hook para forçar verificações de segurança e logs de auditoria
 */
export const useSecurityEnforcement = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      // Log de tentativa de acesso não autorizado
      logger.warn('[SECURITY] Tentativa de acesso sem autenticação detectada', {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        component: 'useSecurityEnforcement'
      });
    }
  }, [user, isLoading]);

  // Função para logar acessos críticos a dados
  const logDataAccess = async (tableName: string, operation: string, resourceId?: string) => {
    if (!user) return;

    try {
      await supabase.rpc('log_security_access', {
        p_table_name: tableName,
        p_operation: operation,
        p_resource_id: resourceId
      });
    } catch (error) {
      // Falhar silenciosamente para não quebrar a experiência do usuário
      logger.error('[SECURITY] Erro ao registrar log de auditoria:', error);
    }
  };

  // Função para verificar permissões antes de operações críticas
  const enforceUserDataAccess = (dataUserId: string, operation: string = 'read') => {
    if (!user) {
      logger.error('[SECURITY] Tentativa de acesso a dados sem autenticação', {
        operation,
        dataUserId,
        component: 'useSecurityEnforcement'
      });
      throw new Error('Acesso negado: usuário não autenticado');
    }

    if (user.id !== dataUserId) {
      logger.error('[SECURITY] Tentativa de acesso a dados de outro usuário', {
        currentUserId: user.id,
        targetUserId: dataUserId,
        operation,
        component: 'useSecurityEnforcement'
      });
      throw new Error('Acesso negado: dados de outro usuário');
    }
  };

  return {
    logDataAccess,
    enforceUserDataAccess,
    isAuthenticated: !!user
  };
};
