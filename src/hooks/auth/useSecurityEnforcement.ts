
import { useEffect } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export const useSecurityEnforcement = () => {
  const { user, isLoading } = useSimpleAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      logger.warn('[SECURITY] Tentativa de acesso sem autenticação detectada', {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        component: 'useSecurityEnforcement'
      });
    }
  }, [user, isLoading]);

  const logDataAccess = async (tableName: string, operation: string, resourceId?: string) => {
    if (!user) return;

    try {
      await supabase.rpc('log_security_access', {
        p_table_name: tableName,
        p_operation: operation,
        p_resource_id: resourceId
      });
    } catch (error) {
      logger.error('[SECURITY] Erro ao registrar log de auditoria:', error);
    }
  };

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
