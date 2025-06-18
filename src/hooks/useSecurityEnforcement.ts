
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Hook para forçar verificações de segurança e logs de auditoria - versão corrigida
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

  // Função para logar acessos usando funções corrigidas
  const logDataAccess = async (tableName: string, operation: string, resourceId?: string) => {
    if (!user) return;

    try {
      await supabase.rpc('log_security_access', {
        p_table_name: tableName,
        p_operation: operation,
        p_resource_id: resourceId
      });
    } catch (error) {
      // A função já trata erros silenciosamente
      logger.debug('[SECURITY] Log de auditoria processado:', { tableName, operation });
    }
  };

  // Função para verificar permissões
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

  // Função para log de violações RLS
  const logRLSViolation = async (tableName: string, operation: string, targetUserId?: string) => {
    if (!user) return;

    try {
      await supabase.rpc('log_rls_violation_attempt', {
        p_table_name: tableName,
        p_operation: operation,
        p_user_id: targetUserId
      });
      
      logger.warn('[SECURITY] Violação RLS registrada', {
        table: tableName,
        operation,
        userId: user.id.substring(0, 8) + '***'
      });
    } catch (error) {
      logger.error('[SECURITY] Erro ao registrar violação RLS:', error);
    }
  };

  return {
    logDataAccess,
    enforceUserDataAccess,
    logRLSViolation,
    isAuthenticated: !!user
  };
};
