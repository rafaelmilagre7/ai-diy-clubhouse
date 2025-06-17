
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

interface RLSValidationResult {
  table_name: string;
  rls_enabled: boolean;
  has_policies: boolean;
  policy_count: number;
  security_status: string;
  risk_level: 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO';
}

/**
 * Hook para validação detalhada do RLS - Fase 3
 */
export const useRLSValidation = () => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  // Executar validação completa do RLS
  const validateCompleteRLS = useCallback(async (): Promise<RLSValidationResult[]> => {
    if (!user || !isAdmin) {
      throw new Error('Acesso negado: apenas administradores podem executar validação RLS');
    }

    try {
      const { data, error } = await supabase.rpc('validate_complete_rls_security');

      if (error) {
        logger.error('[RLS-VALIDATION] Erro na validação:', error);
        throw error;
      }

      // Processar e enriquecer dados de validação
      const enrichedData = (data || []).map((item: any) => ({
        ...item,
        risk_level: getRiskLevel(item.security_status)
      }));

      logger.info('[RLS-VALIDATION] Validação concluída:', {
        totalTables: enrichedData.length,
        protectedTables: enrichedData.filter(t => t.security_status === '✅ PROTEGIDO').length,
        criticalTables: enrichedData.filter(t => t.risk_level === 'CRÍTICO').length
      });

      return enrichedData;
    } catch (error: any) {
      logger.error('[RLS-VALIDATION] Erro na validação completa:', error);
      throw error;
    }
  }, [user, isAdmin]);

  // Validar tabela específica
  const validateTableRLS = useCallback(async (tableName: string): Promise<RLSValidationResult | null> => {
    if (!user || !isAdmin) {
      throw new Error('Acesso negado');
    }

    try {
      const allResults = await validateCompleteRLS();
      return allResults.find(result => result.table_name === tableName) || null;
    } catch (error: any) {
      logger.error(`[RLS-VALIDATION] Erro ao validar tabela ${tableName}:`, error);
      throw error;
    }
  }, [user, isAdmin, validateCompleteRLS]);

  // Obter estatísticas de segurança resumidas
  const getSecurityStats = useCallback(async () => {
    if (!user || !isAdmin) {
      throw new Error('Acesso negado');
    }

    try {
      const results = await validateCompleteRLS();
      
      const stats = {
        total: results.length,
        protected: results.filter(r => r.security_status === '✅ PROTEGIDO').length,
        critical: results.filter(r => r.risk_level === 'CRÍTICO').length,
        warning: results.filter(r => r.risk_level === 'ALTO').length,
        percentage: 0
      };

      stats.percentage = Math.round((stats.protected / stats.total) * 100);

      return stats;
    } catch (error: any) {
      logger.error('[RLS-VALIDATION] Erro ao obter estatísticas:', error);
      throw error;
    }
  }, [user, isAdmin, validateCompleteRLS]);

  return {
    validateCompleteRLS,
    validateTableRLS,
    getSecurityStats,
    isAdmin
  };
};

// Função auxiliar para determinar nível de risco
function getRiskLevel(securityStatus: string): 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO' {
  switch (securityStatus) {
    case '✅ PROTEGIDO':
    case '✅ SEGURO':
      return 'BAIXO';
    case '⚠️ RLS DESABILITADO':
      return 'ALTO';
    case '🔴 SEM PROTEÇÃO':
      return 'CRÍTICO';
    default:
      return 'MÉDIO';
  }
}
