
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';

interface SyncMetric {
  id: string;
  timestamp: number;
  type: 'cache_miss' | 'stale_data' | 'sync_delay' | 'conflict' | 'realtime_fail';
  component: string;
  description: string;
  data?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SyncHealth {
  score: number; // 0-100
  totalIssues: number;
  criticalIssues: number;
  lastCheck: number;
  trends: {
    improving: boolean;
    worseningComponents: string[];
  };
}

export const useSyncMonitor = () => {
  const { user } = useAuth();
  const { log, logWarning, logError } = useLogging();
  const [metrics, setMetrics] = useState<SyncMetric[]>([]);
  const [health, setHealth] = useState<SyncHealth>({
    score: 100,
    totalIssues: 0,
    criticalIssues: 0,
    lastCheck: Date.now(),
    trends: { improving: false, worseningComponents: [] }
  });
  
  const metricsRef = useRef<SyncMetric[]>([]);
  const componentStatsRef = useRef<Map<string, { issues: number, lastIssue: number }>>(new Map());

  // Reportar métrica de sincronização
  const reportSyncIssue = useCallback((
    type: SyncMetric['type'],
    component: string,
    description: string,
    data?: any,
    severity: SyncMetric['severity'] = 'medium'
  ) => {
    const metric: SyncMetric = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      component,
      description,
      data,
      severity
    };

    // Adicionar à lista de métricas
    metricsRef.current = [...metricsRef.current.slice(-99), metric]; // Manter apenas últimas 100
    setMetrics([...metricsRef.current]);

    // Atualizar estatísticas do componente
    const componentStats = componentStatsRef.current.get(component) || { issues: 0, lastIssue: 0 };
    componentStats.issues += 1;
    componentStats.lastIssue = Date.now();
    componentStatsRef.current.set(component, componentStats);

    // Log baseado na severidade
    const logData = {
      type,
      component,
      description,
      data: data ? JSON.stringify(data).substring(0, 200) : undefined,
      user_id: user?.id,
      critical: severity === 'critical'
    };

    switch (severity) {
      case 'critical':
        logError(`[SYNC CRITICAL] ${component}: ${description}`, logData);
        break;
      case 'high':
        logError(`[SYNC HIGH] ${component}: ${description}`, logData);
        break;
      case 'medium':
        logWarning(`[SYNC MEDIUM] ${component}: ${description}`, logData);
        break;
      case 'low':
        log(`[SYNC LOW] ${component}: ${description}`, logData);
        break;
    }

    // Atualizar saúde geral
    updateHealthScore();
  }, [user?.id, log, logWarning, logError]);

  // Calcular score de saúde
  const updateHealthScore = useCallback(() => {
    const now = Date.now();
    const recentMetrics = metricsRef.current.filter(m => now - m.timestamp < 5 * 60 * 1000); // Últimos 5 min
    
    const criticalCount = recentMetrics.filter(m => m.severity === 'critical').length;
    const highCount = recentMetrics.filter(m => m.severity === 'high').length;
    const mediumCount = recentMetrics.filter(m => m.severity === 'medium').length;
    const lowCount = recentMetrics.filter(m => m.severity === 'low').length;

    // Calcular score (0-100)
    let score = 100;
    score -= criticalCount * 25; // Critical issues: -25 points each
    score -= highCount * 10;     // High issues: -10 points each
    score -= mediumCount * 3;    // Medium issues: -3 points each
    score -= lowCount * 1;       // Low issues: -1 point each
    score = Math.max(0, score);

    // Identificar componentes com mais problemas
    const componentIssues = new Map<string, number>();
    recentMetrics.forEach(m => {
      componentIssues.set(m.component, (componentIssues.get(m.component) || 0) + 1);
    });
    
    const worseningComponents = Array.from(componentIssues.entries())
      .filter(([_, count]) => count >= 3)
      .map(([component]) => component);

    const newHealth: SyncHealth = {
      score,
      totalIssues: recentMetrics.length,
      criticalIssues: criticalCount,
      lastCheck: now,
      trends: {
        improving: score > health.score,
        worseningComponents
      }
    };

    setHealth(newHealth);

    // Log se a saúde está degradada
    if (score < 70) {
      logWarning(`Saúde da sincronização degradada`, {
        score,
        criticalIssues: criticalCount,
        totalIssues: recentMetrics.length,
        user_id: user?.id
      });
    }
  }, [health.score, user?.id, logWarning]);

  // Monitorar diferenças entre cache e servidor
  const checkCacheConsistency = useCallback(async (
    cacheData: any,
    serverQuery: () => Promise<any>,
    component: string,
    identifier: string
  ) => {
    try {
      const serverData = await serverQuery();
      
      // Comparar timestamps ou versões se disponíveis
      const cacheTimestamp = cacheData?.updated_at || cacheData?.created_at;
      const serverTimestamp = serverData?.updated_at || serverData?.created_at;
      
      if (cacheTimestamp && serverTimestamp) {
        const cacheTime = new Date(cacheTimestamp).getTime();
        const serverTime = new Date(serverTimestamp).getTime();
        const diffMinutes = (serverTime - cacheTime) / (1000 * 60);
        
        if (diffMinutes > 5) { // Cache mais de 5 minutos desatualizado
          reportSyncIssue(
            'stale_data',
            component,
            `Cache desatualizado há ${Math.round(diffMinutes)} minutos`,
            { identifier, cacheTime, serverTime },
            diffMinutes > 30 ? 'high' : 'medium'
          );
        }
      }

      // Comparar estruturas de dados críticas
      if (JSON.stringify(cacheData) !== JSON.stringify(serverData)) {
        reportSyncIssue(
          'cache_miss',
          component,
          `Inconsistência detectada entre cache e servidor`,
          { identifier, hasCacheData: !!cacheData, hasServerData: !!serverData },
          'medium'
        );
      }
    } catch (error) {
      reportSyncIssue(
        'sync_delay',
        component,
        `Erro ao verificar consistência: ${error}`,
        { identifier, error: String(error) },
        'high'
      );
    }
  }, [reportSyncIssue]);

  // Verificar status do realtime
  const checkRealtimeStatus = useCallback(() => {
    const channels = supabase.getChannels();
    
    channels.forEach(channel => {
      const state = channel.state;
      
      if (state === 'closed' || state === 'errored') {
        reportSyncIssue(
          'realtime_fail',
          'realtime',
          `Canal ${channel.topic} em estado: ${state}`,
          { channelTopic: channel.topic, state },
          'high'
        );
      }
    });

    // Se não há canais ativos mas deveriam ter
    if (channels.length === 0 && user) {
      reportSyncIssue(
        'realtime_fail',
        'realtime',
        'Nenhum canal realtime ativo detectado',
        { userLoggedIn: !!user },
        'medium'
      );
    }
  }, [reportSyncIssue, user]);

  // Auto-verificação periódica
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkRealtimeStatus();
      updateHealthScore();
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, [user, checkRealtimeStatus, updateHealthScore]);

  // Limpar métricas antigas
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;
      
      metricsRef.current = metricsRef.current.filter(m => m.timestamp > oneHourAgo);
      setMetrics([...metricsRef.current]);
    }, 10 * 60 * 1000); // A cada 10 minutos

    return () => clearInterval(cleanup);
  }, []);

  return {
    metrics,
    health,
    reportSyncIssue,
    checkCacheConsistency,
    checkRealtimeStatus,
    // Utilitários para componentes
    helpers: {
      trackQueryDuration: (component: string, identifier: string) => {
        const start = Date.now();
        return () => {
          const duration = Date.now() - start;
          if (duration > 3000) { // Mais de 3 segundos
            reportSyncIssue(
              'sync_delay',
              component,
              `Query lenta: ${duration}ms`,
              { identifier, duration },
              duration > 10000 ? 'high' : 'medium'
            );
          }
        };
      },
      
      trackCacheHit: (component: string, hit: boolean, identifier: string) => {
        if (!hit) {
          reportSyncIssue(
            'cache_miss',
            component,
            `Cache miss detectado`,
            { identifier },
            'low'
          );
        }
      }
    }
  };
};
