
import { useState, useCallback } from 'react';
import { storageUrlManager, StorageURLOptions, StorageURLResult } from '@/services/storageUrlManager';
import { toast } from 'sonner';

export const useStorageURL = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<StorageURLResult | null>(null);

  /**
   * Otimiza URL de storage geral para usar o domínio personalizado
   */
  const optimizeStorageURL = useCallback(async (
    originalUrl: string,
    options: StorageURLOptions = {}
  ): Promise<string> => {
    if (!originalUrl) {
      throw new Error('URL de storage é obrigatória');
    }

    setIsOptimizing(true);

    try {
      console.log(`[useStorageURL] Otimizando URL de storage:`, originalUrl);

      const result = await storageUrlManager.optimizeStorageURL(originalUrl, {
        enableTracking: true,
        priority: 'normal',
        ...options
      });
      
      setLastOptimization(result);

      console.log(`[useStorageURL] Otimização concluída:`, {
        success: result.success,
        url: result.optimizedUrl.substring(0, 50) + '...'
      });

      return result.optimizedUrl;

    } catch (error) {
      console.error('[useStorageURL] Erro na otimização:', error);
      
      // Fallback silencioso para storage geral
      return originalUrl;
      
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  /**
   * Otimiza múltiplas URLs de storage em batch
   */
  const optimizeBatchStorageURLs = useCallback(async (
    urls: string[], 
    options: StorageURLOptions = {}
  ): Promise<Record<string, string>> => {
    console.log(`[useStorageURL] Otimizando ${urls.length} URLs de storage em batch`);
    
    const urlsWithType = urls.map(url => ({ url, type: 'storage' as const }));
    const results = await storageUrlManager.optimizeBatchURLs(urlsWithType, options);
    
    // Converter para formato simples
    const simpleResults: Record<string, string> = {};
    Object.entries(results).forEach(([originalUrl, result]) => {
      simpleResults[originalUrl] = result.optimizedUrl;
    });
    
    console.log(`[useStorageURL] Batch de storage concluído: ${Object.keys(simpleResults).length} URLs processadas`);
    return simpleResults;
  }, []);

  /**
   * Detecta automaticamente o tipo de arquivo e otimiza adequadamente
   */
  const optimizeURLByType = useCallback(async (
    originalUrl: string,
    options: StorageURLOptions = {}
  ): Promise<string> => {
    if (!originalUrl) {
      return originalUrl;
    }

    try {
      // Detectar tipo de arquivo pela extensão ou cabeçalho Content-Type
      const fileExtension = originalUrl.split('.').pop()?.toLowerCase();
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];

      if (fileExtension && imageExtensions.includes(fileExtension)) {
        return await storageUrlManager.optimizeImageURL(originalUrl, options).then(r => r.optimizedUrl);
      } else if (fileExtension && documentExtensions.includes(fileExtension)) {
        return await storageUrlManager.optimizeDocumentURL(originalUrl, options).then(r => r.optimizedUrl);
      } else {
        return await optimizeStorageURL(originalUrl, options);
      }
    } catch (error) {
      console.error('[useStorageURL] Erro na otimização automática:', error);
      return originalUrl;
    }
  }, [optimizeStorageURL]);

  /**
   * Limpa cache de storage geral
   */
  const clearStorageCache = useCallback(() => {
    storageUrlManager.clearCacheForType('storage');
    setLastOptimization(null);
    toast.success('Cache de storage limpo com sucesso');
  }, []);

  /**
   * Estatísticas consolidadas de todos os tipos
   */
  const getStorageStats = useCallback(() => {
    return storageUrlManager.getStatsByType();
  }, []);

  return {
    optimizeStorageURL,
    optimizeBatchStorageURLs,
    optimizeURLByType,
    clearStorageCache,
    getStorageStats,
    isOptimizing,
    lastOptimization
  };
};
