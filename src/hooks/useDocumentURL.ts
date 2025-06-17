
import { useState, useCallback } from 'react';
import { storageUrlManager, StorageURLOptions, StorageURLResult } from '@/services/storageUrlManager';
import { toast } from 'sonner';

export const useDocumentURL = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<StorageURLResult | null>(null);

  /**
   * Otimiza URL de documento para usar o domínio personalizado
   */
  const optimizeDocumentURL = useCallback(async (
    originalUrl: string,
    options: StorageURLOptions = {}
  ): Promise<string> => {
    if (!originalUrl) {
      throw new Error('URL do documento é obrigatória');
    }

    setIsOptimizing(true);

    try {
      console.log(`[useDocumentURL] Otimizando URL de documento:`, originalUrl);

      const result = await storageUrlManager.optimizeDocumentURL(originalUrl, {
        enableTracking: true,
        priority: 'normal',
        ...options
      });
      
      setLastOptimization(result);

      console.log(`[useDocumentURL] Otimização concluída:`, {
        success: result.success,
        url: result.optimizedUrl.substring(0, 50) + '...'
      });

      return result.optimizedUrl;

    } catch (error) {
      console.error('[useDocumentURL] Erro na otimização:', error);
      
      // Toast para documentos críticos
      if (options.priority === 'high') {
        toast.error('Erro ao otimizar URL do documento. Usando URL original.');
      }
      
      return originalUrl;
      
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  /**
   * Otimiza múltiplas URLs de documentos em batch
   */
  const optimizeBatchDocumentURLs = useCallback(async (
    urls: string[], 
    options: StorageURLOptions = {}
  ): Promise<Record<string, string>> => {
    console.log(`[useDocumentURL] Otimizando ${urls.length} URLs de documentos em batch`);
    
    const urlsWithType = urls.map(url => ({ url, type: 'document' as const }));
    const results = await storageUrlManager.optimizeBatchURLs(urlsWithType, options);
    
    // Converter para formato simples
    const simpleResults: Record<string, string> = {};
    Object.entries(results).forEach(([originalUrl, result]) => {
      simpleResults[originalUrl] = result.optimizedUrl;
    });
    
    console.log(`[useDocumentURL] Batch de documentos concluído: ${Object.keys(simpleResults).length} URLs processadas`);
    return simpleResults;
  }, []);

  /**
   * Valida se uma URL de documento está acessível
   */
  const validateDocumentURL = useCallback(async (url: string, maxAttempts: number = 2): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5 segundos para documentos
        });
        
        if (response.ok) {
          console.log(`[useDocumentURL] Documento validado com sucesso (tentativa ${attempt})`);
          return true;
        }
        
        throw new Error(`HTTP ${response.status}`);
        
      } catch (error) {
        console.warn(`[useDocumentURL] Tentativa ${attempt}/${maxAttempts} falhou:`, error);
        
        if (attempt === maxAttempts) {
          return false;
        }
        
        // Esperar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    return false;
  }, []);

  /**
   * Limpa cache de documentos
   */
  const clearDocumentCache = useCallback(() => {
    storageUrlManager.clearCacheForType('document');
    setLastOptimization(null);
    toast.success('Cache de documentos limpo com sucesso');
  }, []);

  return {
    optimizeDocumentURL,
    optimizeBatchDocumentURLs,
    validateDocumentURL,
    clearDocumentCache,
    isOptimizing,
    lastOptimization
  };
};
