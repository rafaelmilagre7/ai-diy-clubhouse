
import { useState, useCallback } from 'react';
import { storageUrlManager, StorageURLOptions, StorageURLResult } from '@/services/storageUrlManager';
import { toast } from 'sonner';

export const useCertificateURL = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<StorageURLResult | null>(null);

  /**
   * Otimiza URL de certificado para usar o proxy real
   */
  const optimizeCertificateURL = useCallback(async (
    originalUrl: string,
    options: StorageURLOptions = {}
  ): Promise<string> => {
    if (!originalUrl) {
      throw new Error('URL do certificado é obrigatória');
    }

    setIsOptimizing(true);

    try {
      console.log(`[useCertificateURL] Otimizando URL de certificado:`, originalUrl);

      const result = await storageUrlManager.optimizeCertificateURL(originalUrl, {
        enableTracking: true,
        priority: 'high', // Certificados têm prioridade alta
        ...options
      });
      
      setLastOptimization(result);

      console.log(`[useCertificateURL] Otimização concluída:`, {
        success: result.success,
        url: result.optimizedUrl.substring(0, 50) + '...'
      });

      return result.optimizedUrl;

    } catch (error) {
      console.error('[useCertificateURL] Erro na otimização:', error);
      
      // Toast para certificados (importante para o usuário)
      if (options.priority === 'high') {
        toast.error('Erro ao otimizar URL do certificado. Usando URL original.');
      }
      
      return originalUrl;
      
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  /**
   * Otimiza múltiplas URLs de certificados em batch
   */
  const optimizeBatchCertificateURLs = useCallback(async (
    urls: string[], 
    options: StorageURLOptions = {}
  ): Promise<Record<string, string>> => {
    console.log(`[useCertificateURL] Otimizando ${urls.length} URLs de certificados em batch`);
    
    const urlsWithType = urls.map(url => ({ url, type: 'certificate' as const }));
    const results = await storageUrlManager.optimizeBatchURLs(urlsWithType, options);
    
    // Converter para formato simples
    const simpleResults: Record<string, string> = {};
    Object.entries(results).forEach(([originalUrl, result]) => {
      simpleResults[originalUrl] = result.optimizedUrl;
    });
    
    console.log(`[useCertificateURL] Batch de certificados concluído: ${Object.keys(simpleResults).length} URLs processadas`);
    return simpleResults;
  }, []);

  /**
   * Valida se uma URL de certificado está acessível
   */
  const validateCertificateURL = useCallback(async (url: string, maxAttempts: number = 3): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(8000) // 8 segundos para certificados
        });
        
        if (response.ok) {
          console.log(`[useCertificateURL] Certificado validado com sucesso (tentativa ${attempt})`);
          return true;
        }
        
        throw new Error(`HTTP ${response.status}`);
        
      } catch (error) {
        console.warn(`[useCertificateURL] Tentativa ${attempt}/${maxAttempts} falhou:`, error);
        
        if (attempt === maxAttempts) {
          return false;
        }
        
        // Esperar antes da próxima tentativa (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }
    
    return false;
  }, []);

  /**
   * Limpa cache de certificados
   */
  const clearCertificateCache = useCallback(() => {
    storageUrlManager.clearCacheForType('certificate');
    setLastOptimization(null);
    toast.success('Cache de certificados limpo com sucesso');
  }, []);

  return {
    optimizeCertificateURL,
    optimizeBatchCertificateURLs,
    validateCertificateURL,
    clearCertificateCache,
    isOptimizing,
    lastOptimization
  };
};
