
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';

interface HealthStatus {
  database: 'healthy' | 'slow' | 'error';
  realtime: 'connected' | 'connecting' | 'disconnected' | 'error';
  auth: 'authenticated' | 'unauthenticated' | 'error';
  storage: 'healthy' | 'error' | 'untested';
  overall: 'healthy' | 'degraded' | 'critical';
}

interface PerformanceMetrics {
  databaseLatency: number;
  realtimeLatency: number;
  queriesPerMinute: number;
  errorRate: number;
  lastUpdated: number;
}

export const useSupabaseHealthCheck = () => {
  const { user } = useAuth();
  const { log, logWarning, logError } = useLogging();
  
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    database: 'healthy',
    realtime: 'disconnected',
    auth: 'unauthenticated',
    storage: 'untested',
    overall: 'healthy'
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    databaseLatency: 0,
    realtimeLatency: 0,
    queriesPerMinute: 0,
    errorRate: 0,
    lastUpdated: Date.now()
  });

  const [isChecking, setIsChecking] = useState(false);

  // Verificar saúde do banco de dados
  const checkDatabaseHealth = useCallback(async (): Promise<'healthy' | 'slow' | 'error'> => {
    try {
      const start = Date.now();
      
      // Query simples para testar conectividade
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      const latency = Date.now() - start;
      
      if (error) {
        logError('Database health check failed', { error: error.message, user_id: user?.id });
        return 'error';
      }

      // Atualizar métricas
      setMetrics(prev => ({
        ...prev,
        databaseLatency: latency,
        lastUpdated: Date.now()
      }));

      if (latency > 3000) {
        logWarning('Database responding slowly', { latency, user_id: user?.id });
        return 'slow';
      }

      return 'healthy';
    } catch (error) {
      logError('Database health check exception', { error: String(error), user_id: user?.id });
      return 'error';
    }
  }, [user?.id, logError, logWarning]);

  // Verificar status do realtime
  const checkRealtimeHealth = useCallback((): 'connected' | 'connecting' | 'disconnected' | 'error' => {
    try {
      const channels = supabase.getChannels();
      
      if (channels.length === 0) {
        return 'disconnected';
      }

      const states = channels.map(channel => channel.state);
      
      if (states.some(state => state === 'joined')) {
        return 'connected';
      }
      
      if (states.some(state => state === 'joining')) {
        return 'connecting';
      }
      
      if (states.some(state => state === 'errored' || state === 'closed')) {
        logWarning('Realtime channels in error state', { 
          channelStates: states, 
          user_id: user?.id 
        });
        return 'error';
      }

      return 'disconnected';
    } catch (error) {
      logError('Realtime health check failed', { error: String(error), user_id: user?.id });
      return 'error';
    }
  }, [user?.id, logWarning, logError]);

  // Verificar status da autenticação
  const checkAuthHealth = useCallback(async (): Promise<'authenticated' | 'unauthenticated' | 'error'> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logError('Auth health check failed', { error: error.message, user_id: user?.id });
        return 'error';
      }

      return session ? 'authenticated' : 'unauthenticated';
    } catch (error) {
      logError('Auth health check exception', { error: String(error), user_id: user?.id });
      return 'error';
    }
  }, [user?.id, logError]);

  // Verificar storage
  const checkStorageHealth = useCallback(async (): Promise<'healthy' | 'error' | 'untested'> => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        logWarning('Storage health check failed', { error: error.message, user_id: user?.id });
        return 'error';
      }

      return 'healthy';
    } catch (error) {
      logError('Storage health check exception', { error: String(error), user_id: user?.id });
      return 'error';
    }
  }, [user?.id, logWarning, logError]);

  // Executar verificação completa
  const performHealthCheck = useCallback(async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    log('Iniciando verificação de saúde do Supabase', { user_id: user?.id });

    try {
      const [databaseStatus, authStatus, storageStatus] = await Promise.all([
        checkDatabaseHealth(),
        checkAuthHealth(),
        checkStorageHealth()
      ]);

      const realtimeStatus = checkRealtimeHealth();

      const newStatus: HealthStatus = {
        database: databaseStatus,
        realtime: realtimeStatus,
        auth: authStatus,
        storage: storageStatus,
        overall: 'healthy'
      };

      // Determinar status geral
      const criticalIssues = [
        databaseStatus === 'error',
        authStatus === 'error',
        storageStatus === 'error'
      ].filter(Boolean).length;

      const degradedIssues = [
        databaseStatus === 'slow',
        realtimeStatus === 'error' || realtimeStatus === 'disconnected'
      ].filter(Boolean).length;

      if (criticalIssues > 0) {
        newStatus.overall = 'critical';
        logError('Supabase em estado crítico', { 
          criticalIssues, 
          status: newStatus, 
          user_id: user?.id 
        });
      } else if (degradedIssues > 0) {
        newStatus.overall = 'degraded';
        logWarning('Supabase com desempenho degradado', { 
          degradedIssues, 
          status: newStatus, 
          user_id: user?.id 
        });
      }

      setHealthStatus(newStatus);
      
      log('Verificação de saúde concluída', { 
        status: newStatus, 
        user_id: user?.id 
      });

    } catch (error) {
      logError('Erro durante verificação de saúde', { 
        error: String(error), 
        user_id: user?.id 
      });
      
      setHealthStatus(prev => ({
        ...prev,
        overall: 'critical'
      }));
    } finally {
      setIsChecking(false);
    }
  }, [
    isChecking, 
    user?.id, 
    log, 
    logError, 
    logWarning,
    checkDatabaseHealth,
    checkAuthHealth,
    checkStorageHealth,
    checkRealtimeHealth
  ]);

  // Verificação automática periódica
  useEffect(() => {
    // Verificação inicial
    performHealthCheck();

    // Verificação a cada 2 minutos
    const interval = setInterval(performHealthCheck, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [performHealthCheck]);

  // Monitorar mudanças no usuário
  useEffect(() => {
    if (user) {
      // Re-verificar quando o usuário faz login
      performHealthCheck();
    }
  }, [user?.id, performHealthCheck]);

  return {
    healthStatus,
    metrics,
    isChecking,
    performHealthCheck,
    
    // Utilitários para outros hooks
    utils: {
      isDatabaseHealthy: () => healthStatus.database === 'healthy',
      isRealtimeConnected: () => healthStatus.realtime === 'connected',
      isOverallHealthy: () => healthStatus.overall === 'healthy',
      shouldShowWarning: () => healthStatus.overall === 'degraded',
      shouldShowError: () => healthStatus.overall === 'critical'
    }
  };
};
