
import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

/**
 * Hook para gerenciar segurança RLS - FASE 3 COMPLETA
 * Integrado com monitoramento automático e validação avançada
 */
export const useRLSSecurityManager = () => {
  const { user, profile } = useAuth();

  // Validar status de segurança das tabelas com nova função da Fase 3
  const validateRLSSecurity = useCallback(async () => {
    if (!user || !profile) return null;

    try {
      // Usar a nova função get_rls_security_summary da Fase 3
      const { data, error } = await supabase.rpc('get_rls_security_summary');
      
      if (error) {
        logger.error('[RLS-SECURITY] Erro ao validar segurança:', error);
        return null;
      }

      // Log crítico se houver problemas
      if (data?.critical_tables > 0) {
        logger.warn('[RLS-SECURITY] Problemas críticos detectados:', {
          critical: data.critical_tables,
          status: data.status,
          percentage: data.security_percentage
        });
      }

      return {
        totalTables: data?.total_tables || 0,
        protectedTables: data?.protected_tables || 0,
        criticalIssues: data?.critical_tables || 0,
        highRiskIssues: data?.rls_disabled_tables || 0,
        securityScore: data?.security_percentage || 0,
        status: data?.status || 'UNKNOWN',
        lastCheck: data?.last_check || new Date().toISOString()
      };
    } catch (error) {
      logger.error('[RLS-SECURITY] Erro na validação:', error);
      return null;
    }
  }, [user, profile]);

  // Log de acesso seguro aprimorado para Fase 3
  const logSecureAccess = useCallback(async (tableName: string, operation: string, resourceId?: string) => {
    if (!user) return;

    try {
      await supabase.rpc('log_security_access', {
        p_table_name: tableName,
        p_operation: operation,
        p_resource_id: resourceId
      });
      
      logger.debug('[RLS-SECURITY] Acesso registrado:', {
        table: tableName,
        operation,
        resourceId,
        userId: user.id.substring(0, 8) + '***'
      });
    } catch (error) {
      // Falhar silenciosamente para não quebrar a experiência
      logger.debug('[RLS-SECURITY] Log de acesso processado');
    }
  }, [user]);

  // Verificar violações de RLS com integração da Fase 3
  const checkRLSViolation = useCallback(async (tableName: string, operation: string, userId?: string) => {
    if (!user) return false;

    try {
      await supabase.rpc('log_rls_violation_attempt', {
        p_table_name: tableName,
        p_operation: operation,
        p_user_id: userId
      });
      
      logger.warn('[RLS-SECURITY] Violação registrada:', {
        table: tableName,
        operation,
        targetUserId: userId?.substring(0, 8) + '***'
      });
      
      return true;
    } catch (error) {
      logger.error('[RLS-SECURITY] Erro ao registrar violação:', error);
      return false;
    }
  }, [user]);

  // Executar verificação de regressão manual
  const runRegressionCheck = useCallback(async () => {
    if (!user || profile?.role !== 'admin') {
      logger.warn('[RLS-SECURITY] Acesso negado para verificação de regressão');
      return false;
    }

    try {
      await supabase.rpc('check_rls_regression');
      logger.info('[RLS-SECURITY] Verificação de regressão executada com sucesso');
      return true;
    } catch (error) {
      logger.error('[RLS-SECURITY] Erro na verificação de regressão:', error);
      return false;
    }
  }, [user, profile]);

  // Monitoramento automático aprimorado para Fase 3
  useEffect(() => {
    if (!user || !profile) return;

    const runSecurityCheck = async () => {
      const securityStatus = await validateRLSSecurity();
      
      if (securityStatus) {
        // Log detalhado do status
        logger.info('[RLS-SECURITY] Status do sistema:', {
          score: securityStatus.securityScore,
          status: securityStatus.status,
          critical: securityStatus.criticalIssues,
          protected: securityStatus.protectedTables,
          total: securityStatus.totalTables
        });

        // Alerta para problemas críticos
        if (securityStatus.criticalIssues > 0) {
          logger.error('[RLS-SECURITY] ALERTA CRÍTICO:', {
            score: securityStatus.securityScore,
            critical: securityStatus.criticalIssues,
            status: securityStatus.status
          });
        }
      }
    };

    // Executar verificação inicial
    runSecurityCheck();

    // Verificação periódica aprimorada
    if (profile.role === 'admin') {
      const interval = setInterval(runSecurityCheck, 10 * 60 * 1000); // 10 minutos para admins
      return () => clearInterval(interval);
    } else {
      // Verificação menos frequente para usuários normais
      const interval = setInterval(runSecurityCheck, 30 * 60 * 1000); // 30 minutos
      return () => clearInterval(interval);
    }
  }, [user, profile, validateRLSSecurity]);

  return {
    validateRLSSecurity,
    logSecureAccess,
    checkRLSViolation,
    runRegressionCheck, // Nova função da Fase 3
    isSecurityActive: !!user,
    isAdmin: profile?.role === 'admin'
  };
};
