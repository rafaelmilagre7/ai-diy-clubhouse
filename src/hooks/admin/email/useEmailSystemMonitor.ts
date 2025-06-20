
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface SystemMetrics {
  responseTime: number;
  successRate: number;
  errorCount: number;
  lastCheck: Date;
  status: 'healthy' | 'degraded' | 'down';
  recentErrors: string[];
}

export const useEmailSystemMonitor = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    responseTime: 0,
    successRate: 100,
    errorCount: 0,
    lastCheck: new Date(),
    status: 'healthy',
    recentErrors: []
  });
  
  const [isMonitoring, setIsMonitoring] = useState(false);

  const performHealthCheck = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('test-resend-health', {
        body: {
          testType: 'monitor_check',
          timestamp: new Date().toISOString()
        }
      });

      const responseTime = Date.now() - startTime;
      
      if (error || !data?.success) {
        setMetrics(prev => ({
          ...prev,
          responseTime,
          errorCount: prev.errorCount + 1,
          lastCheck: new Date(),
          status: 'down',
          recentErrors: [
            error?.message || data?.error || 'Sistema indisponível',
            ...prev.recentErrors.slice(0, 4)
          ]
        }));
        return false;
      }

      // Sistema saudável
      setMetrics(prev => {
        const newSuccessRate = prev.errorCount > 0 
          ? Math.max(85, 100 - (prev.errorCount * 5))
          : 100;

        return {
          ...prev,
          responseTime,
          successRate: newSuccessRate,
          lastCheck: new Date(),
          status: responseTime > 5000 ? 'degraded' : 'healthy',
          recentErrors: prev.recentErrors
        };
      });

      return true;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      setMetrics(prev => ({
        ...prev,
        responseTime,
        errorCount: prev.errorCount + 1,
        lastCheck: new Date(),
        status: 'down',
        recentErrors: [
          `Erro crítico: ${error.message}`,
          ...prev.recentErrors.slice(0, 4)
        ]
      }));
      
      return false;
    }
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Check inicial
    performHealthCheck();
    
    // Monitoramento contínuo a cada 2 minutos
    const interval = setInterval(performHealthCheck, 2 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [performHealthCheck]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Iniciar monitoramento automaticamente
  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  return {
    metrics,
    isMonitoring,
    performHealthCheck,
    startMonitoring,
    stopMonitoring
  };
};
