
import { useState, useCallback } from 'react';
import { calculateRealHealthMetrics, RealHealthCheckResult } from '@/utils/realHealthCheckManager';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

export interface RealHealthProgress {
  stage: 'idle' | 'loading' | 'success' | 'error' | 'empty';
  message: string;
  data: RealHealthCheckResult['data'];
  error?: string;
}

export const useRealHealthCheck = () => {
  const [progress, setProgress] = useState<RealHealthProgress>({
    stage: 'idle',
    message: 'Pronto para calcular métricas',
    data: null
  });

  const calculateMetrics = useCallback(async () => {
    setProgress({
      stage: 'loading',
      message: 'Calculando métricas de saúde dos usuários...',
      data: null
    });

    const result = await calculateRealHealthMetrics();

    if (!result.success) {
      setProgress({
        stage: 'error',
        message: result.message,
        data: null,
        error: result.error
      });
      
      toast.error('Erro ao calcular métricas', {
        description: result.message
      });
      return;
    }

    if (result.data && result.data.totalUsers === 0) {
      setProgress({
        stage: 'empty',
        message: 'Nenhum usuário encontrado no sistema',
        data: result.data
      });
      
      toast.info('Sistema vazio', {
        description: 'Nenhum usuário encontrado para análise'
      });
      return;
    }

    setProgress({
      stage: 'success',
      message: result.message,
      data: result.data
    });

    toast.success('Métricas calculadas', {
      description: result.message
    });
  }, []);

  const reset = useCallback(() => {
    setProgress({
      stage: 'idle',
      message: 'Pronto para calcular métricas',
      data: null
    });
  }, []);

  return {
    progress,
    calculateMetrics,
    reset,
    isLoading: progress.stage === 'loading'
  };
};
