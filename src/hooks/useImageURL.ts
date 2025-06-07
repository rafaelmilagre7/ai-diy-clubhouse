
import { useState, useCallback } from 'react';
import { storageUrlManager, StorageURLOptions, StorageURLResult } from '@/services/storageUrlManager';
import { toast } from 'sonner';

export const useImageURL = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<StorageURLResult | null>(null);

  /**
   * Otimiza URL de imagem para usar o domínio personalizado
   */
  const optimizeImageURL = useCallback(async (
    originalUrl: string,
    options: StorageURLOptions = {}
  ): Promise<string> => {
    if (!originalUrl) {
      throw new Error('URL da imagem é obrigatória');
    }

    setIsOptimizing(true);

    try {
      console.log(`[useImageURL] Otimizando URL de imagem:`, originalUrl);

      const result = await storageUrlManager.optimizeImageURL(originalUrl, {
        enableTracking: true,
        priority: 'normal',
        ...options
      });
      
      setLastOptimization(result);

      console.log(`[useImageURL] Otimização concluída:`, {
        source: result.source,
        cached: result.cached,
        url: result.optimizedUrl.substring(0, 50) + '...'
      });

      return result.optimizedUrl;

    } catch (error) {
      console.error('[useImageURL] Erro na otimização:', error);
      
      // Fallback silencioso para imagens
      return originalUrl;
      
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  /**
   * Otimiza múltiplas URLs de imagens em batch
   */
  const optimizeBatchImageURLs = useCallback(async (
    urls: string[], 
    options: StorageURLOptions = {}
  ): Promise<Record<string, string>> => {
    console.log(`[useImageURL] Otimizando ${urls.length} URLs de imagens em batch`);
    
    const urlsWithType = urls.map(url => ({ url, type: 'image' as const }));
    const results = await storageUrlManager.optimizeBatchURLs(urlsWithType, options);
    
    // Converter para formato simples de URL -> URL otimizada
    const simpleResults: Record<string, string> = {};
    Object.entries(results).forEach(([originalUrl, result]) => {
      simpleResults[originalUrl] = result.optimizedUrl;
    });
    
    console.log(`[useImageURL] Batch de imagens concluído: ${Object.keys(simpleResults).length} URLs processadas`);
    return simpleResults;
  }, []);

  /**
   * Valida se uma URL de imagem está acessível
   */
  const validateImageURL = useCallback(async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000) // 3 segundos timeout para imagens
      });
      
      return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch (error) {
      console.warn(`[useImageURL] Falha na validação da imagem: ${url}`, error);
      return false;
    }
  }, []);

  /**
   * Limpa cache de imagens
   */
  const clearImageCache = useCallback(() => {
    storageUrlManager.clearCacheForType('image');
    setLastOptimization(null);
    toast.success('Cache de imagens limpo com sucesso');
  }, []);

  return {
    optimizeImageURL,
    optimizeBatchImageURLs,
    validateImageURL,
    clearImageCache,
    isOptimizing,
    lastOptimization
  };
};
