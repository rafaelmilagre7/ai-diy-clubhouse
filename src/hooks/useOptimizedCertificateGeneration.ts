import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useOptimizedLoading } from './useOptimizedLoading';

export interface CertificateGenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  attempt: number;
  maxAttempts: number;
}

export interface CertificateGenerationOptions {
  maxAttempts?: number;
  timeoutMs?: number;
  showProgress?: boolean;
}

export const useOptimizedCertificateGeneration = (options: CertificateGenerationOptions = {}) => {
  const {
    maxAttempts = 3,
    timeoutMs = 30000,
    showProgress = true
  } = options;

  const [loadingState, loadingActions] = useOptimizedLoading({
    minLoadingTime: 1000,
    timeout: timeoutMs,
    showProgressBar: showProgress,
    retryCount: maxAttempts
  });

  const [generationState, setGenerationState] = useState<CertificateGenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: '',
    attempt: 0,
    maxAttempts
  });

  const updateProgress = useCallback((step: string, progress: number) => {
    setGenerationState(prev => ({
      ...prev,
      currentStep: step,
      progress
    }));
    
    if (showProgress) {
      loadingActions.setProgress(progress);
    }
  }, [loadingActions, showProgress]);

  const generateWithRetry = useCallback(async <T>(
    generationFn: () => Promise<T>,
    operationName: string = 'certificado'
  ): Promise<T | null> => {
    
    loadingActions.reset();
    setGenerationState({
      isGenerating: true,
      progress: 0,
      currentStep: 'Iniciando...',
      attempt: 0,
      maxAttempts
    });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        loadingActions.startLoading();
        
        setGenerationState(prev => ({
          ...prev,
          attempt,
          currentStep: `Tentativa ${attempt}/${maxAttempts}`
        }));

        console.log(`🔄 [CERT-GEN] Tentativa ${attempt}/${maxAttempts} - ${operationName}`);

        // Execute generation with timeout
        const result = await Promise.race([
          generationFn(),
          new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error(`Timeout na tentativa ${attempt} (${timeoutMs}ms)`));
            }, timeoutMs);
          })
        ]);

        loadingActions.stopLoading();
        
        setGenerationState(prev => ({
          ...prev,
          isGenerating: false,
          progress: 100,
          currentStep: 'Concluído'
        }));

        toast.success(`${operationName} gerado com sucesso!`);
        
        console.log(`✅ [CERT-GEN] ${operationName} gerado na tentativa ${attempt}`);
        return result;

      } catch (error: any) {
        console.error(`❌ [CERT-GEN] Tentativa ${attempt} falhou:`, error);
        
        const isLastAttempt = attempt === maxAttempts;
        const isTimeout = error.message?.includes('Timeout');
        
        if (isLastAttempt) {
          loadingActions.stopLoading();
          
          setGenerationState(prev => ({
            ...prev,
            isGenerating: false,
            currentStep: 'Falhou'
          }));

          if (isTimeout) {
            toast.error('Tempo esgotado', {
              description: `A geração do ${operationName} demorou mais que ${timeoutMs/1000}s. Tente novamente ou recarregue a página.`
            });
          } else {
            toast.error('Erro na geração', {
              description: `Não foi possível gerar o ${operationName} após ${maxAttempts} tentativas.`
            });
          }
          
          return null;
        } else {
          // Retry with backoff
          const retryDelay = attempt * 1000; // 1s, 2s, 3s...
          
          toast.warning(`Tentativa ${attempt} falhou`, {
            description: `Tentando novamente em ${retryDelay/1000}s...`
          });
          
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          loadingActions.retry();
        }
      }
    }

    return null;
  }, [maxAttempts, timeoutMs, loadingActions]);

  const cancelGeneration = useCallback(() => {
    loadingActions.reset();
    setGenerationState({
      isGenerating: false,
      progress: 0,
      currentStep: 'Cancelado',
      attempt: 0,
      maxAttempts
    });
    
    toast.info('Geração cancelada pelo usuário');
  }, [loadingActions, maxAttempts]);

  return {
    generationState,
    loadingState,
    generateWithRetry,
    updateProgress,
    cancelGeneration,
    isGenerating: generationState.isGenerating || loadingState.isLoading
  };
};