
import { useState, useCallback } from 'react';
import { calculateBasicHealthMetrics, generateSimulatedHealthData } from '@/utils/healthCheckInitializer';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

export interface InitializationProgress {
  stage: 'idle' | 'calculating' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  details?: string;
}

export const useHealthCheckInitializer = () => {
  const [progress, setProgress] = useState<InitializationProgress>({
    stage: 'idle',
    progress: 0,
    message: 'Pronto para inicializar'
  });

  const initializeWithProgress = useCallback(async () => {
    try {
      // Etapa 1: Calcular métricas reais
      setProgress({
        stage: 'calculating',
        progress: 30,
        message: 'Calculando métricas de saúde reais...',
        details: 'Analisando dados de progresso, engajamento e atividade dos usuários'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Etapa 2: Processar dados
      setProgress({
        stage: 'processing',
        progress: 70,
        message: 'Processando métricas calculadas...',
        details: 'Categorizando usuários e gerando relatórios'
      });

      const result = await calculateBasicHealthMetrics();
      
      // Etapa 3: Finalizar com sucesso
      setProgress({
        stage: 'completed',
        progress: 100,
        message: 'Health Check inicializado com sucesso!',
        details: `${result.details.totalUsers} usuários analisados - ${result.details.healthyUsers} saudáveis, ${result.details.atRiskUsers} em risco, ${result.details.criticalUsers} críticos`
      });

      if (result.success) {
        toast.success('Health Check inicializado', {
          description: result.message
        });
      } else {
        toast.warning('Inicialização com dados simulados', {
          description: 'Alguns dados podem estar incompletos'
        });
      }

    } catch (error: any) {
      logger.error('[HEALTH INIT] Erro na inicialização:', error);
      
      // Fallback para dados simulados em caso de erro
      const fallbackData = generateSimulatedHealthData();
      
      setProgress({
        stage: 'completed',
        progress: 100,
        message: 'Inicialização com dados simulados',
        details: `${fallbackData.details.totalUsers} usuários simulados para demonstração`
      });
      
      toast.info('Health Check inicializado com dados simulados', {
        description: 'Sistema pronto para uso com dados de demonstração'
      });
    }
  }, []);

  const reset = useCallback(() => {
    setProgress({
      stage: 'idle',
      progress: 0,
      message: 'Pronto para inicializar'
    });
  }, []);

  return {
    progress,
    initialize: initializeWithProgress,
    reset,
    isProcessing: progress.stage === 'processing' || progress.stage === 'calculating'
  };
};
