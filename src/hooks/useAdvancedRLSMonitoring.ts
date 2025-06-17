
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

interface RLSSecuritySummary {
  total_tables: number;
  protected_tables: number;
  critical_tables: number;
  rls_disabled_tables: number;
  no_policies_tables: number;
  security_percentage: number;
  status: 'SECURE' | 'CRITICAL' | 'WARNING' | 'UNKNOWN';
  last_check: string;
}

interface SecurityAlert {
  id: string;
  event_type: string;
  action: string;
  details: any;
  severity: string;
  timestamp: string;
}

/**
 * Hook avançado para monitoramento RLS - Fase 3
 * Integra com as novas funções de monitoramento automático
 */
export const useAdvancedRLSMonitoring = () => {
  const { user, profile } = useAuth();
  const [securitySummary, setSecuritySummary] = useState<RLSSecuritySummary | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se o usuário é admin
  const isAdmin = profile?.role === 'admin';

  // Buscar resumo de segurança
  const fetchSecuritySummary = useCallback(async () => {
    if (!user || !isAdmin) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.rpc('get_rls_security_summary');

      if (fetchError) {
        logger.error('[RLS-MONITORING] Erro ao buscar resumo de segurança:', fetchError);
        throw fetchError;
      }

      setSecuritySummary(data);
      
      logger.info('[RLS-MONITORING] Resumo de segurança atualizado:', {
        status: data?.status,
        percentage: data?.security_percentage,
        protected: data?.protected_tables,
        total: data?.total_tables
      });

    } catch (error: any) {
      logger.error('[RLS-MONITORING] Erro ao carregar resumo:', error);
      setError(error.message || 'Erro ao carregar resumo de segurança');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  // Buscar alertas de segurança
  const fetchSecurityAlerts = useCallback(async () => {
    if (!user || !isAdmin) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('audit_logs')
        .select('*')
        .in('event_type', ['security_regression', 'security_upgrade', 'security_violation'])
        .order('timestamp', { ascending: false })
        .limit(50);

      if (fetchError) {
        logger.error('[RLS-MONITORING] Erro ao buscar alertas:', fetchError);
        throw fetchError;
      }

      setSecurityAlerts(data || []);
      
    } catch (error: any) {
      logger.error('[RLS-MONITORING] Erro ao carregar alertas:', error);
    }
  }, [user, isAdmin]);

  // Executar verificação de regressão manual
  const runRegressionCheck = useCallback(async () => {
    if (!user || !isAdmin) return;

    try {
      const { error } = await supabase.rpc('check_rls_regression');
      
      if (error) {
        logger.error('[RLS-MONITORING] Erro ao executar verificação:', error);
        throw error;
      }

      // Recarregar dados após verificação
      await Promise.all([
        fetchSecuritySummary(),
        fetchSecurityAlerts()
      ]);

      logger.info('[RLS-MONITORING] Verificação de regressão executada com sucesso');
      
    } catch (error: any) {
      logger.error('[RLS-MONITORING] Erro na verificação de regressão:', error);
      throw error;
    }
  }, [user, isAdmin, fetchSecuritySummary, fetchSecurityAlerts]);

  // Carregar dados iniciais
  useEffect(() => {
    if (isAdmin) {
      Promise.all([
        fetchSecuritySummary(),
        fetchSecurityAlerts()
      ]);
    }
  }, [isAdmin, fetchSecuritySummary, fetchSecurityAlerts]);

  // Monitoramento em tempo real de novos alertas
  useEffect(() => {
    if (!isAdmin) return;

    const subscription = supabase
      .channel('security_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
          filter: 'event_type=in.(security_regression,security_upgrade,security_violation)'
        },
        (payload) => {
          logger.info('[RLS-MONITORING] Novo alerta de segurança recebido:', payload);
          fetchSecurityAlerts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isAdmin, fetchSecurityAlerts]);

  return {
    // Dados
    securitySummary,
    securityAlerts,
    loading,
    error,
    
    // Ações
    fetchSecuritySummary,
    fetchSecurityAlerts,
    runRegressionCheck,
    
    // Status
    isAdmin,
    isSecure: securitySummary?.status === 'SECURE',
    isCritical: securitySummary?.status === 'CRITICAL',
    securityPercentage: securitySummary?.security_percentage || 0,
    
    // Contadores
    totalTables: securitySummary?.total_tables || 0,
    protectedTables: securitySummary?.protected_tables || 0,
    criticalTables: securitySummary?.critical_tables || 0,
    alertsCount: securityAlerts.length
  };
};
