
import { useState, useCallback } from 'react';
import { initializeHealthCheckData } from '@/utils/healthCheckInitializer';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

export interface InitializationProgress {
  stage: 'idle' | 'simulating' | 'processing' | 'completed' | 'error';
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

  const simulateData = useCallback(() => {
    setProgress({
      stage: 'simulating',
      progress: 25,
      message: 'Gerando dados de demonstração...',
      details: 'Criando métricas simuladas para visualização imediata'
    });

    // Simular dados para demonstração imediata
    setTimeout(() => {
      setProgress({
        stage: 'completed',
        progress: 100,
        message: 'Dados simulados carregados com sucesso!',
        details: 'Sistema pronto para uso com dados de demonstração'
      });
      
      toast.success('Health Check inicializado com dados simulados', {
        description: 'Processamento real continuará em background'
      });
    }, 800);
  }, []);

  const initializeWithProgress = useCallback(async () => {
    try {
      // Primeiro, carregar dados simulados para resposta imediata
      simulateData();
      
      // Aguardar um pouco antes de começar processamento real
      setTimeout(async () => {
        setProgress({
          stage: 'processing',
          progress: 30,
          message: 'Processando dados reais em background...',
          details: 'Calculando métricas de saúde dos usuários'
        });

        try {
          const result = await initializeHealthCheckData();
          
          setProgress({
            stage: 'completed',
            progress: 100,
            message: 'Inicialização completa!',
            details: `Processados ${result.details.totalUsers} usuários com sucesso`
          });

          if (result.success) {
            toast.success('Health Check totalmente inicializado', {
              description: 'Dados reais processados com sucesso'
            });
          } else {
            toast.warning('Inicialização parcial', {
              description: 'Alguns dados podem estar incompletos'
            });
          }
        } catch (error: any) {
          logger.error('[HEALTH INIT] Erro no processamento real:', error);
          setProgress({
            stage: 'error',
            progress: 0,
            message: 'Erro no processamento real',
            details: 'Dados simulados continuam disponíveis'
          });
        }
      }, 1000);

    } catch (error: any) {
      logger.error('[HEALTH INIT] Erro na inicialização:', error);
      setProgress({
        stage: 'error',
        progress: 0,
        message: 'Erro na inicialização',
        details: error.message
      });
      
      toast.error('Falha na inicialização do Health Check', {
        description: error.message || 'Erro desconhecido'
      });
    }
  }, [simulateData]);

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
    isProcessing: progress.stage === 'processing' || progress.stage === 'simulating'
  };
};
