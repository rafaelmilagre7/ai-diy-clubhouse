
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MonitoringMetrics {
  activeInvites: number;
  recentActivity: number;
  errorRate: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  successRate: number;
  pendingDeliveries: number;
  failedDeliveries: number;
  avgResponseTime: number;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

export const useRealTimeMonitoring = () => {
  const [metrics, setMetrics] = useState<MonitoringMetrics>({
    activeInvites: 0,
    recentActivity: 0,
    errorRate: 0,
    systemHealth: 'healthy',
    successRate: 95,
    pendingDeliveries: 0,
    failedDeliveries: 0,
    avgResponseTime: 1200
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get active invites count
      const { data: activeInvites, error: activeError } = await supabase
        .from('invites')
        .select('id')
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString());

      if (activeError) throw activeError;

      // Get recent activity (last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const { data: recentInvites, error: recentError } = await supabase
        .from('invites')
        .select('id')
        .gte('created_at', yesterday.toISOString());

      if (recentError) throw recentError;

      // Simulate other metrics
      const errorRate = Math.random() * 5; // 0-5% error rate
      const systemHealth: 'healthy' | 'warning' | 'critical' = 
        errorRate < 1 ? 'healthy' : 
        errorRate < 3 ? 'warning' : 'critical';

      const successRate = 100 - errorRate;
      const pendingDeliveries = Math.floor(Math.random() * 10);
      const failedDeliveries = Math.floor(Math.random() * 3);
      const avgResponseTime = 800 + Math.floor(Math.random() * 800);

      setMetrics({
        activeInvites: activeInvites?.length || 0,
        recentActivity: recentInvites?.length || 0,
        errorRate,
        systemHealth,
        successRate,
        pendingDeliveries,
        failedDeliveries,
        avgResponseTime
      });

      setIsConnected(true);

    } catch (error: any) {
      console.error('Erro ao carregar dados de monitoramento:', error);
      setError(error.message);
      setIsConnected(false);
      toast.error('Erro ao carregar monitoramento em tempo real');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const refreshMetrics = async () => {
    await fetchMonitoringData();
  };

  useEffect(() => {
    fetchMonitoringData();
    
    // Set up real-time monitoring (refresh every 30 seconds)
    const interval = setInterval(fetchMonitoringData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMonitoringData,
    alerts,
    isConnected,
    acknowledgeAlert,
    clearAlerts,
    refreshMetrics
  };
};
