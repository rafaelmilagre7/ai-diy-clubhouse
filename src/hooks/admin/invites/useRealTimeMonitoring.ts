
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLogging } from '@/hooks/useLogging';
import { toast } from 'sonner';

interface MonitoringMetrics {
  activeInvites: number;
  pendingDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  avgResponseTime: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export const useRealTimeMonitoring = () => {
  const [metrics, setMetrics] = useState<MonitoringMetrics>({
    activeInvites: 0,
    pendingDeliveries: 0,
    failedDeliveries: 0,
    successRate: 0,
    avgResponseTime: 0,
    systemHealth: 'healthy'
  });
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { log, logWarning } = useLogging();

  const checkSystemHealth = useCallback(async () => {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Buscar métricas em tempo real
      const [
        { data: activeInvites },
        { data: recentDeliveries },
        { data: failedDeliveries }
      ] = await Promise.all([
        supabase
          .from('invites')
          .select('id')
          .is('used_at', null)
          .gt('expires_at', now.toISOString()),
        
        supabase
          .from('invite_deliveries')
          .select('status, created_at')
          .gte('created_at', oneHourAgo.toISOString()),
        
        supabase
          .from('invite_deliveries')
          .select('id')
          .eq('status', 'failed')
          .gte('created_at', oneHourAgo.toISOString())
      ]);

      const totalDeliveries = recentDeliveries?.length || 0;
      const successfulDeliveries = recentDeliveries?.filter(d => 
        ['sent', 'delivered', 'opened', 'clicked'].includes(d.status)
      ).length || 0;

      const successRate = totalDeliveries > 0 
        ? (successfulDeliveries / totalDeliveries) * 100 
        : 100;

      // Determinar saúde do sistema
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (successRate < 50) systemHealth = 'critical';
      else if (successRate < 80) systemHealth = 'warning';

      const newMetrics: MonitoringMetrics = {
        activeInvites: activeInvites?.length || 0,
        pendingDeliveries: recentDeliveries?.filter(d => d.status === 'pending').length || 0,
        failedDeliveries: failedDeliveries?.length || 0,
        successRate,
        avgResponseTime: Math.random() * 200 + 50, // Simulado
        systemHealth
      };

      setMetrics(newMetrics);

      // Gerar alertas se necessário
      if (systemHealth === 'critical') {
        addAlert({
          type: 'error',
          title: 'Sistema Crítico',
          message: `Taxa de sucesso baixa: ${successRate.toFixed(1)}%`
        });
      } else if (newMetrics.failedDeliveries > 10) {
        addAlert({
          type: 'warning',
          title: 'Muitas Falhas',
          message: `${newMetrics.failedDeliveries} entregas falharam na última hora`
        });
      }

      log('Métricas de monitoramento atualizadas', newMetrics);

    } catch (error: any) {
      logWarning('Erro ao verificar saúde do sistema', { error: error.message });
      setMetrics(prev => ({ ...prev, systemHealth: 'critical' }));
    }
  }, [log, logWarning]);

  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>) => {
    const newAlert: Alert = {
      ...alert,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    setAlerts(prev => [newAlert, ...prev.slice(0, 19)]); // Manter apenas 20 alertas

    // Mostrar toast para alertas críticos
    if (alert.type === 'error') {
      toast.error(alert.title, { description: alert.message });
    } else if (alert.type === 'warning') {
      toast.warning(alert.title, { description: alert.message });
    }
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Configurar monitoramento em tempo real
  useEffect(() => {
    // Check inicial
    checkSystemHealth();

    // Intervalo de verificação
    const interval = setInterval(checkSystemHealth, 30000); // 30 segundos

    // Subscription para mudanças em tempo real
    const subscription = supabase
      .channel('invite-monitoring')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'invite_deliveries'
      }, () => {
        checkSystemHealth();
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          log('Monitoramento em tempo real conectado');
        }
      });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [checkSystemHealth, log]);

  return {
    metrics,
    alerts,
    isConnected,
    acknowledgeAlert,
    clearAlerts,
    refreshMetrics: checkSystemHealth
  };
};
