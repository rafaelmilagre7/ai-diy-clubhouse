
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAnalytics } from './useSupabaseAnalytics';
import { usePerformance } from '@/contexts/performance/PerformanceProvider';
import { logger } from '@/utils/logger';

interface AlertRule {
  id: string;
  name: string;
  condition: (data: any) => boolean;
  severity: 'low' | 'medium' | 'high';
  message: (data: any) => string;
  cooldown: number; // em milissegundos
  enabled: boolean;
}

export const useSupabaseAlerts = () => {
  const { data: analyticsData } = useSupabaseAnalytics({ timeRange: '1h' });
  const { addAlert } = usePerformance();
  const [lastAlertTimes, setLastAlertTimes] = useState<Record<string, number>>({});

  const alertRules: AlertRule[] = [
    {
      id: 'high_error_rate',
      name: 'Taxa de Erro Alta no DB',
      condition: (data) => data?.dbStats?.errorRate > 10,
      severity: 'high',
      message: (data) => `Taxa de erro crítica no banco: ${data.dbStats.errorRate.toFixed(1)}%`,
      cooldown: 600000, // 10 minutos
      enabled: true
    },
    {
      id: 'slow_queries',
      name: 'Queries Lentas Detectadas',
      condition: (data) => data?.dbStats?.avgResponseTime > 2000,
      severity: 'medium',
      message: (data) => `Tempo médio de query alto: ${data.dbStats.avgResponseTime.toFixed(0)}ms`,
      cooldown: 300000, // 5 minutos
      enabled: true
    },
    {
      id: 'auth_failures',
      name: 'Muitas Falhas de Autenticação',
      condition: (data) => {
        const failureRate = data?.authStats ? 
          (data.authStats.failedLogins / data.authStats.totalLogins) * 100 : 0;
        return failureRate > 15;
      },
      severity: 'medium',
      message: (data) => {
        const failureRate = (data.authStats.failedLogins / data.authStats.totalLogins) * 100;
        return `Taxa alta de falhas de login: ${failureRate.toFixed(1)}%`;
      },
      cooldown: 900000, // 15 minutos
      enabled: true
    },
    {
      id: 'high_memory_usage',
      name: 'Uso Alto de Memória',
      condition: (data) => data?.realTimeMetrics?.memoryUsage > 85,
      severity: 'high',
      message: (data) => `Uso de memória crítico: ${data.realTimeMetrics.memoryUsage.toFixed(1)}%`,
      cooldown: 300000, // 5 minutos
      enabled: true
    },
    {
      id: 'edge_function_errors',
      name: 'Erros em Edge Functions',
      condition: (data) => data?.edgeFunctionStats?.errorRate > 5,
      severity: 'medium',
      message: (data) => `Taxa de erro alta em Edge Functions: ${data.edgeFunctionStats.errorRate.toFixed(1)}%`,
      cooldown: 600000, // 10 minutos
      enabled: true
    },
    {
      id: 'low_active_users',
      name: 'Poucos Usuários Ativos',
      condition: (data) => data?.authStats?.activeUsers24h < 5,
      severity: 'low',
      message: (data) => `Apenas ${data.authStats.activeUsers24h} usuários ativos nas últimas 24h`,
      cooldown: 3600000, // 1 hora
      enabled: true
    }
  ];

  const isInCooldown = useCallback((ruleId: string, cooldown: number): boolean => {
    const lastTime = lastAlertTimes[ruleId];
    if (!lastTime) return false;
    return Date.now() - lastTime < cooldown;
  }, [lastAlertTimes]);

  const triggerAlert = useCallback((rule: AlertRule, data: any) => {
    if (isInCooldown(rule.id, rule.cooldown)) return;

    const message = rule.message(data);
    
    addAlert({
      type: 'performance',
      message,
      severity: rule.severity,
      metadata: {
        ruleId: rule.id,
        ruleName: rule.name,
        data: data
      }
    });

    setLastAlertTimes(prev => ({
      ...prev,
      [rule.id]: Date.now()
    }));

    logger.warn(`Supabase Alert: ${rule.name}`, {
      message,
      severity: rule.severity,
      ruleId: rule.id,
      data
    });
  }, [addAlert, isInCooldown]);

  const checkAllRules = useCallback(() => {
    if (!analyticsData) return;

    alertRules.forEach(rule => {
      if (!rule.enabled) return;
      
      try {
        if (rule.condition(analyticsData)) {
          triggerAlert(rule, analyticsData);
        }
      } catch (error) {
        logger.error(`Erro ao verificar regra ${rule.id}`, { error, rule: rule.name });
      }
    });
  }, [analyticsData, triggerAlert]);

  // Verificar regras quando os dados mudarem
  useEffect(() => {
    if (analyticsData) {
      checkAllRules();
    }
  }, [analyticsData, checkAllRules]);

  const getAlertStats = useCallback(() => {
    const now = Date.now();
    const last24h = 24 * 60 * 60 * 1000;
    
    const recentAlerts = Object.entries(lastAlertTimes)
      .filter(([, timestamp]) => now - timestamp < last24h);
    
    const ruleStats = alertRules.map(rule => ({
      id: rule.id,
      name: rule.name,
      enabled: rule.enabled,
      severity: rule.severity,
      lastTriggered: lastAlertTimes[rule.id] || null,
      timeSinceLastTrigger: lastAlertTimes[rule.id] 
        ? now - lastAlertTimes[rule.id] 
        : null
    }));

    return {
      totalRules: alertRules.length,
      enabledRules: alertRules.filter(r => r.enabled).length,
      recentAlertsCount: recentAlerts.length,
      ruleStats
    };
  }, [lastAlertTimes]);

  return {
    checkAllRules,
    getAlertStats,
    alertRules,
    lastAlertTimes
  };
};
