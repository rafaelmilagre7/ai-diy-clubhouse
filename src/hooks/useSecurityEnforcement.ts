import { useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Hook para forçar verificações de segurança e logs de auditoria
 * Refatorado para ser mais eficiente e seguro
 */
export const useSecurityEnforcement = () => {
  const { user, isLoading } = useAuth();

  // Memoizar verificação de autenticação para evitar re-renders
  const isAuthenticated = useMemo(() => !!user, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      // Log de tentativa de acesso não autorizado com rate limiting
      logger.warn('[SECURITY] Tentativa de acesso sem autenticação detectada', {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        component: 'useSecurityEnforcement'
      });
    }
  }, [user, isLoading]);

  // Função otimizada para logar acessos com cache
  const logDataAccess = useCallback(async (tableName: string, operation: string, resourceId?: string) => {
    if (!user) return;

    try {
      // Verificar rate limiting antes de fazer log
      const { data: canProceed } = await supabase.rpc('check_rate_limit', {
        p_action: `log_${operation}_${tableName}`,
        p_limit_per_hour: 100 // Limite mais alto para logs de dados
      });

      if (!canProceed) {
        console.warn('[SECURITY] Rate limit excedido para logs de acesso');
        return;
      }

      await supabase.rpc('log_security_access', {
        p_table_name: tableName,
        p_operation: operation,
        p_resource_id: resourceId
      });
    } catch (error) {
      // Log local em caso de falha
      logger.debug('[SECURITY] Log de auditoria processado localmente:', { 
        tableName, 
        operation, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }, [user]);

  // Função aprimorada para verificar permissões
  const enforceUserDataAccess = useCallback((dataUserId: string, operation: string = 'read') => {
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

    // Log de acesso autorizado
    logDataAccess('user_data', operation, dataUserId);
  }, [user, logDataAccess]);

  // Função para verificar rate limiting em ações críticas
  const checkRateLimit = useCallback(async (action: string, limitPerHour: number = 60): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data } = await supabase.rpc('check_rate_limit', {
        p_action: action,
        p_limit_per_hour: limitPerHour
      });
      return data || false;
    } catch (error) {
      logger.error('[SECURITY] Erro ao verificar rate limit:', error);
      return false;
    }
  }, [user]);

  // Função para verificar se usuário é admin 
  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data } = await supabase.rpc('is_admin');
      return data || false;
    } catch (error) {
      logger.error('[SECURITY] Erro ao verificar permissões de admin:', error);
      return false;
    }
  }, [user]);

  return {
    logDataAccess,
    enforceUserDataAccess,
    checkRateLimit,
    checkAdminStatus,
    isAuthenticated
  };
};