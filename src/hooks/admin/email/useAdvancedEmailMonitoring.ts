
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface MonitoringMetrics {
  timestamp: string;
  health: {
    overall: 'healthy' | 'degraded' | 'critical';
    resend_status: 'connected' | 'degraded' | 'down';
    queue_status: 'normal' | 'backed_up' | 'critical';
    functions_status: 'operational' | 'degraded' | 'down';
  };
  performance: {
    avg_response_time: number;
    success_rate: number;
    queue_length: number;
    processing_rate: number;
  };
  errors: {
    recent_errors: number;
    error_rate: number;
    critical_issues: string[];
  };
  statistics: {
    emails_sent_today: number;
    emails_queued: number;
    emails_failed: number;
    invites_pending: number;
  };
}

export const useAdvancedEmailMonitoring = () => {
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    
    try {
      console.log('📊 Buscando métricas do sistema...');
      
      const { data, error } = await supabase.functions.invoke('email-system-monitor', {
        body: {}
      });

      if (error) {
        console.error('❌ Erro ao buscar métricas:', error);
        throw error;
      }

      if (data?.success && data?.metrics) {
        setMetrics(data.metrics);
        setLastUpdate(new Date());
        console.log('✅ Métricas atualizadas:', data.metrics.health.overall);
      } else {
        throw new Error('Resposta inválida do monitoramento');
      }
    } catch (error: any) {
      console.error('❌ Erro no monitoramento:', error);
      
      // Fallback metrics em caso de erro
      setMetrics({
        timestamp: new Date().toISOString(),
        health: {
          overall: 'critical',
          resend_status: 'down',
          queue_status: 'unknown',
          functions_status: 'down'
        },
        performance: {
          avg_response_time: 0,
          success_rate: 0,
          queue_length: 0,
          processing_rate: 0
        },
        errors: {
          recent_errors: 1,
          error_rate: 100,
          critical_issues: [`Erro no monitoramento: ${error.message}`]
        },
        statistics: {
          emails_sent_today: 0,
          emails_queued: 0,
          emails_failed: 0,
          invites_pending: 0
        }
      });
      setLastUpdate(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processEmailQueue = useCallback(async () => {
    try {
      console.log('📬 Processando fila de emails...');
      
      const { data, error } = await supabase.functions.invoke('process-email-queue', {
        body: {}
      });

      if (error) {
        console.error('❌ Erro ao processar fila:', error);
        throw error;
      }

      console.log('✅ Fila processada:', data);
      
      // Atualizar métricas após processar
      await fetchMetrics();
      
      return data;
    } catch (error: any) {
      console.error('❌ Erro no processamento da fila:', error);
      throw error;
    }
  }, [fetchMetrics]);

  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshEnabled(prev => !prev);
  }, []);

  // Auto-refresh das métricas
  useEffect(() => {
    // Busca inicial
    fetchMetrics();

    // Setup auto-refresh se habilitado
    if (isAutoRefreshEnabled) {
      const interval = setInterval(fetchMetrics, 30000); // 30 segundos
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, isAutoRefreshEnabled]);

  // Calcular status de saúde geral
  const getHealthStatus = useCallback(() => {
    if (!metrics) return { status: 'unknown', color: 'gray', message: 'Carregando...' };

    const { overall } = metrics.health;
    
    switch (overall) {
      case 'healthy':
        return { 
          status: 'healthy', 
          color: 'green', 
          message: 'Sistema operacional' 
        };
      case 'degraded':
        return { 
          status: 'degraded', 
          color: 'yellow', 
          message: 'Sistema com avisos' 
        };
      case 'critical':
        return { 
          status: 'critical', 
          color: 'red', 
          message: 'Sistema com problemas críticos' 
        };
      default:
        return { 
          status: 'unknown', 
          color: 'gray', 
          message: 'Status desconhecido' 
        };
    }
  }, [metrics]);

  return {
    metrics,
    isLoading,
    lastUpdate,
    isAutoRefreshEnabled,
    fetchMetrics,
    processEmailQueue,
    toggleAutoRefresh,
    getHealthStatus
  };
};
