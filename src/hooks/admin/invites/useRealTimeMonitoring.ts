
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MonitoringMetrics {
  activeInvites: number;
  recentActivity: number;
  errorRate: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export const useRealTimeMonitoring = () => {
  const [metrics, setMetrics] = useState<MonitoringMetrics>({
    activeInvites: 0,
    recentActivity: 0,
    errorRate: 0,
    systemHealth: 'healthy'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Simulate error rate and system health
      const errorRate = Math.random() * 5; // 0-5% error rate
      const systemHealth: 'healthy' | 'warning' | 'critical' = 
        errorRate < 1 ? 'healthy' : 
        errorRate < 3 ? 'warning' : 'critical';

      setMetrics({
        activeInvites: activeInvites?.length || 0,
        recentActivity: recentInvites?.length || 0,
        errorRate,
        systemHealth
      });

    } catch (error: any) {
      console.error('Erro ao carregar dados de monitoramento:', error);
      setError(error.message);
      toast.error('Erro ao carregar monitoramento em tempo real');
    } finally {
      setLoading(false);
    }
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
    refetch: fetchMonitoringData
  };
};
