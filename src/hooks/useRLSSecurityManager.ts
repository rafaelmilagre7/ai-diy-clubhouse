
import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

/**
 * Hook para gerenciar segurança RLS aprimorada após Fase 2
 */
export const useRLSSecurityManager = () => {
  const { user, profile } = useAuth();

  // Validar status de segurança das tabelas
  const validateRLSSecurity = useCallback(async () => {
    if (!user || !profile) return null;

    try {
      const { data, error } = await supabase.rpc('validate_complete_rls_security');
      
      if (error) {
        logger.error('[RLS-SECURITY] Erro ao validar segurança:', error);
        return null;
      }

      const criticalIssues = data?.filter(table => table.risk_level === 'CRÍTICO') || [];
      const highRiskIssues = data?.filter(table => table.risk_level === 'ALTO') || [];
      
      if (criticalIssues.length > 0) {
        logger.warn('[RLS-SECURITY] Problemas críticos detectados:', criticalIssues);
      }

      return {
        totalTables: data?.length || 0,
        protectedTables: data?.filter(table => table.security_status === '✅ PROTEGIDO').length || 0,
        criticalIssues: criticalIssues.length,
        highRiskIssues: highRiskIssues.length,
        securityScore: Math.round(((data?.filter(table => table.security_status === '✅ PROTEGIDO').length || 0) / (data?.length || 1)) * 100)
      };
    } catch (error) {
      logger.error('[RLS-SECURITY] Erro na validação:', error);
      return null;
    }
  }, [user, profile]);

  // Log de acesso seguro
  const logSecureAccess = useCallback(async (tableName: string, operation: string, resourceId?: string) => {
    if (!user) return;

    try {
      await supabase.rpc('log_security_access', {
        p_table_name: tableName,
        p_operation: operation,
        p_resource_id: resourceId
      });
    } catch (error) {
      // Falhar silenciosamente para não quebrar a experiência
      logger.debug('[RLS-SECURITY] Log de acesso processado');
    }
  }, [user]);

  // Verificar violações de RLS
  const checkRLSViolation = useCallback(async (tableName: string, operation: string, userId?: string) => {
    if (!user) return false;

    try {
      await supabase.rpc('log_rls_violation_attempt', {
        p_table_name: tableName,
        p_operation: operation,
        p_user_id: userId
      });
      return true;
    } catch (error) {
      logger.error('[RLS-SECURITY] Erro ao registrar violação:', error);
      return false;
    }
  }, [user]);

  // Monitoramento automático de segurança
  useEffect(() => {
    if (!user || !profile) return;

    const runSecurityCheck = async () => {
      const securityStatus = await validateRLSSecurity();
      
      if (securityStatus && securityStatus.criticalIssues > 0) {
        logger.warn('[RLS-SECURITY] Sistema com problemas críticos de segurança:', {
          score: securityStatus.securityScore,
          critical: securityStatus.criticalIssues
        });
      }
    };

    // Executar verificação inicial
    runSecurityCheck();

    // Verificação periódica (apenas para admins)
    if (profile.role === 'admin') {
      const interval = setInterval(runSecurityCheck, 5 * 60 * 1000); // 5 minutos
      return () => clearInterval(interval);
    }
  }, [user, profile, validateRLSSecurity]);

  return {
    validateRLSSecurity,
    logSecureAccess,
    checkRLSViolation,
    isSecurityActive: !!user
  };
};
