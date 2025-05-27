import { useCallback, useEffect, useRef } from 'react';
import { usePerformance } from '@/contexts/performance/PerformanceProvider';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: any) => boolean;
  severity: 'low' | 'medium' | 'high';
  message: (metrics: any) => string;
  cooldown: number; // ms
  enabled: boolean;
}

export const usePerformanceAlerts = () => {
  const { addAlert, getQueryStats, realTimeStats } = usePerformance();
  const { toast } = useToast();
  const lastAlertTimeRef = useRef<Record<string, number>>({});

  // Regras de alerta predefinidas
  const defaultRules: AlertRule[] = [
    {
      id: 'slow_query_avg',
      name: 'Queries Lentas - Média Alta',
      condition: (stats) => stats.avgDuration > 3000,
      severity: 'medium',
      message: (stats) => `Tempo médio de query alto: ${stats.avgDuration.toFixed(0)}ms`,
      cooldown: 300000, // 5 minutos
      enabled: true
    },
    {
      id: 'high_error_rate',
      name: 'Taxa de Erro Alta',
      condition: (stats) => stats.errorRate > 10,
      severity: 'high',
      message: (stats) => `Taxa de erro crítica: ${stats.errorRate.toFixed(1)}%`,
      cooldown: 180000, // 3 minutos
      enabled: true
    },
    {
      id: 'low_cache_hit',
      name: 'Cache Hit Rate Baixo',
      condition: (stats) => stats.cacheHitRate < 50 && stats.totalQueries > 20,
      severity: 'medium',
      message: (stats) => `Cache hit rate baixo: ${stats.cacheHitRate.toFixed(1)}%`,
      cooldown: 600000, // 10 minutos
      enabled: true
    },
    {
      id: 'many_slow_queries',
      name: 'Muitas Queries Lentas',
      condition: (stats) => stats.slowQueriesCount > 10,
      severity: 'high',
      message: (stats) => `${stats.slowQueriesCount} queries lentas detectadas`,
      cooldown: 300000, // 5 minutos
      enabled: true
    },
    {
      id: 'active_queries_high',
      name: 'Muitas Queries Ativas',
      condition: () => realTimeStats.activeQueries > 20,
      severity: 'medium',
      message: () => `${realTimeStats.activeQueries} queries ativas simultaneamente`,
      cooldown: 120000, // 2 minutos
      enabled: true
    }
  ];

  // Verificar se um alerta está em cooldown
  const isInCooldown = useCallback((ruleId: string, cooldown: number): boolean => {
    const lastTime = lastAlertTimeRef.current[ruleId];
    if (!lastTime) return false;
    
    return Date.now() - lastTime < cooldown;
  }, []);

  // Disparar um alerta
  const triggerAlert = useCallback((rule: AlertRule, metrics: any) => {
    if (isInCooldown(rule.id, rule.cooldown)) return;

    const message = rule.message(metrics);
    
    // Adicionar ao sistema de alertas
    addAlert({
      type: 'performance',
      message,
      severity: rule.severity,
      id: `${rule.id}_${Date.now()}`,
      timestamp: Date.now()
    });

    // Mostrar toast para alertas críticos
    if (rule.severity === 'high') {
      toast({
        title: "Alerta de Performance Crítico",
        description: message,
        variant: "destructive",
      });
    }

    // Atualizar tempo do último alerta
    lastAlertTimeRef.current[rule.id] = Date.now();

    // Log do alerta
    logger.warn(`Performance Alert: ${rule.name}`, {
      message,
      severity: rule.severity,
      ruleId: rule.id,
      metrics
    });
  }, [addAlert, toast, isInCooldown]);

  // Verificar todas as regras
  const checkAllRules = useCallback(async () => {
    try {
      const queryStats = getQueryStats();
      
      for (const rule of defaultRules) {
        if (!rule.enabled) continue;
        
        if (rule.condition(queryStats)) {
          triggerAlert(rule, queryStats);
        }
      }
    } catch (error) {
      logger.error('Erro ao verificar regras de alerta', { error });
    }
  }, [getQueryStats, triggerAlert]);

  // Verificar regra específica
  const checkRule = useCallback((ruleId: string) => {
    const rule = defaultRules.find(r => r.id === ruleId);
    if (!rule || !rule.enabled) return;

    try {
      const queryStats = getQueryStats();
      
      if (rule.condition(queryStats)) {
        triggerAlert(rule, queryStats);
      }
    } catch (error) {
      logger.error(`Erro ao verificar regra ${ruleId}`, { error });
    }
  }, [getQueryStats, triggerAlert]);

  // Adicionar regra customizada
  const addCustomRule = useCallback((rule: Omit<AlertRule, 'id'>) => {
    const customRule: AlertRule = {
      ...rule,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Em uma implementação real, isso seria persistido
    defaultRules.push(customRule);
    
    return customRule.id;
  }, []);

  // Desabilitar regra
  const disableRule = useCallback((ruleId: string) => {
    const rule = defaultRules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = false;
    }
  }, []);

  // Habilitar regra
  const enableRule = useCallback((ruleId: string) => {
    const rule = defaultRules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = true;
    }
  }, []);

  // Obter estatísticas dos alertas
  const getAlertStats = useCallback(() => {
    const now = Date.now();
    const last24h = 24 * 60 * 60 * 1000;
    
    const recentAlerts = Object.entries(lastAlertTimeRef.current)
      .filter(([, timestamp]) => now - timestamp < last24h);
    
    const ruleStats = defaultRules.map(rule => ({
      id: rule.id,
      name: rule.name,
      enabled: rule.enabled,
      lastTriggered: lastAlertTimeRef.current[rule.id] || null,
      timeSinceLastTrigger: lastAlertTimeRef.current[rule.id] 
        ? now - lastAlertTimeRef.current[rule.id] 
        : null
    }));

    return {
      totalRules: defaultRules.length,
      enabledRules: defaultRules.filter(r => r.enabled).length,
      recentAlertsCount: recentAlerts.length,
      ruleStats
    };
  }, []);

  // Verificação automática periódica
  useEffect(() => {
    const interval = setInterval(checkAllRules, 60000); // A cada minuto
    return () => clearInterval(interval);
  }, [checkAllRules]);

  return {
    checkAllRules,
    checkRule,
    addCustomRule,
    disableRule,
    enableRule,
    getAlertStats,
    rules: defaultRules
  };
};

export default usePerformanceAlerts;
