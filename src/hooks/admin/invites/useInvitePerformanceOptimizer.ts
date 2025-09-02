/**
 * Hook para otimização de performance dos convites
 * Inclui warmup de edge functions, timeouts otimizados e monitoramento
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface PerformanceMetrics {
  warmupStatus: 'idle' | 'warming' | 'ready' | 'failed';
  averageInviteTime: number;
  lastWarmup: Date | null;
  successRate: number;
}

export const useInvitePerformanceOptimizer = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    warmupStatus: 'idle',
    averageInviteTime: 0,
    lastWarmup: null,
    successRate: 100
  });

  const [isOptimizing, setIsOptimizing] = useState(false);

  // Função para warmup das edge functions
  const warmupEdgeFunctions = useCallback(async () => {
    if (metrics.warmupStatus === 'warming') return;
    
    setMetrics(prev => ({ ...prev, warmupStatus: 'warming' }));
    setIsOptimizing(true);

    try {
      logger.info('🔥 Iniciando warmup das edge functions de convite', {
        component: 'INVITE_PERFORMANCE_OPTIMIZER'
      });

      const startTime = performance.now();

      // Chamar função de warmup
      const { data, error } = await supabase.functions.invoke('warmup-invites', {
        body: { 
          trigger: 'manual_warmup',
          timestamp: Date.now()
        }
      });

      const endTime = performance.now();
      const warmupDuration = Math.round(endTime - startTime);

      if (error) {
        throw new Error(`Erro no warmup: ${error.message}`);
      }

      logger.info('✅ Warmup concluído com sucesso', {
        component: 'INVITE_PERFORMANCE_OPTIMIZER',
        duration: `${warmupDuration}ms`,
        results: data?.results
      });

      setMetrics(prev => ({
        ...prev,
        warmupStatus: 'ready',
        lastWarmup: new Date()
      }));

      // Toast discreto de sucesso
      toast.success('Sistema otimizado', {
        description: `Edge functions aquecidas em ${warmupDuration}ms`,
        duration: 3000
      });

    } catch (error: any) {
      logger.error('❌ Erro no warmup das edge functions', {
        component: 'INVITE_PERFORMANCE_OPTIMIZER',
        error: error.message
      });

      setMetrics(prev => ({ ...prev, warmupStatus: 'failed' }));

      toast.error('Erro na otimização', {
        description: 'Não foi possível otimizar o sistema',
        duration: 5000
      });
    } finally {
      setIsOptimizing(false);
    }
  }, [metrics.warmupStatus]);

  // Auto-warmup quando necessário
  useEffect(() => {
    const needsWarmup = metrics.warmupStatus === 'idle' || 
                       (metrics.lastWarmup && Date.now() - metrics.lastWarmup.getTime() > 10 * 60 * 1000); // 10 minutos

    if (needsWarmup && !isOptimizing) {
      // Delay pequeno para não bloquear a UI
      const timer = setTimeout(() => {
        warmupEdgeFunctions();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [warmupEdgeFunctions, metrics.lastWarmup, metrics.warmupStatus, isOptimizing]);

  // Função para medir performance de convite
  const measureInvitePerformance = useCallback(async <T>(
    inviteOperation: () => Promise<T>,
    operationName: string = 'invite_operation'
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      logger.info(`⏱️ Iniciando ${operationName}`, {
        component: 'INVITE_PERFORMANCE_OPTIMIZER',
        warmupStatus: metrics.warmupStatus
      });

      const result = await inviteOperation();
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      // Atualizar métricas
      setMetrics(prev => ({
        ...prev,
        averageInviteTime: Math.round((prev.averageInviteTime + duration) / 2),
        successRate: Math.min(100, prev.successRate + 0.5) // Incremento gradual na taxa de sucesso
      }));

      logger.info(`✅ ${operationName} concluído`, {
        component: 'INVITE_PERFORMANCE_OPTIMIZER',
        duration: `${duration}ms`,
        averageTime: `${metrics.averageInviteTime}ms`
      });

      return result;
    } catch (error: any) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      // Atualizar métricas de erro
      setMetrics(prev => ({
        ...prev,
        successRate: Math.max(0, prev.successRate - 5) // Redução na taxa de sucesso
      }));

      logger.error(`❌ ${operationName} falhou`, {
        component: 'INVITE_PERFORMANCE_OPTIMIZER',
        duration: `${duration}ms`,
        error: error.message
      });

      throw error;
    }
  }, [metrics.warmupStatus, metrics.averageInviteTime]);

  // Função para forçar otimização manual
  const forceOptimization = useCallback(async () => {
    toast.info('Otimizando sistema...', {
      description: 'Aquecendo edge functions para melhor performance',
      duration: 3000
    });
    
    await warmupEdgeFunctions();
  }, [warmupEdgeFunctions]);

  return {
    metrics,
    isOptimizing,
    warmupEdgeFunctions,
    measureInvitePerformance,
    forceOptimization,
    isReady: metrics.warmupStatus === 'ready'
  };
};