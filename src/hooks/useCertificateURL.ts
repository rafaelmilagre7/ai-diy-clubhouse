
import { useState, useEffect, useCallback } from 'react';
import { urlManager, URLTransformResult } from '@/services/urlManager';
import { toast } from 'sonner';

export interface CertificateURLOptions {
  enableTracking?: boolean;
  priority?: 'high' | 'normal' | 'low';
  retryAttempts?: number;
}

export const useCertificateURL = () => {
  const [isTransforming, setIsTransforming] = useState(false);
  const [lastTransformation, setLastTransformation] = useState<URLTransformResult | null>(null);

  /**
   * Transforma URL de certificado para usar o domínio personalizado
   */
  const transformCertificateURL = useCallback(async (
    originalUrl: string,
    options: CertificateURLOptions = {}
  ): Promise<string> => {
    const { 
      enableTracking = true,
      priority = 'high',
      retryAttempts = 3 
    } = options;

    if (!originalUrl) {
      throw new Error('URL original é obrigatória');
    }

    setIsTransforming(true);

    try {
      console.log(`[useCertificateURL] Iniciando transformação (prioridade: ${priority}):`, originalUrl);

      // Transformar URL usando o URLManager
      const result = urlManager.transformURL(originalUrl, 'certificate');
      
      setLastTransformation(result);

      // Analytics específico para certificados
      if (enableTracking && result.analytics) {
        trackCertificateURLUsage(result);
      }

      // Verificar se a URL transformada está acessível (para URLs críticas)
      if (priority === 'high') {
        await validateURLAccess(result.url, retryAttempts);
      }

      console.log(`[useCertificateURL] Transformação concluída:`, {
        source: result.source,
        cached: result.cached,
        url: result.url.substring(0, 50) + '...'
      });

      return result.url;

    } catch (error) {
      console.error('[useCertificateURL] Erro na transformação:', error);
      
      // Toast de erro não obstrusivo
      if (priority === 'high') {
        toast.error('Erro ao otimizar URL do certificado. Usando URL original.');
      }
      
      // Fallback seguro
      return originalUrl;
      
    } finally {
      setIsTransforming(false);
    }
  }, []);

  /**
   * Valida se a URL está acessível
   */
  const validateURLAccess = async (url: string, maxAttempts: number): Promise<void> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5 segundos timeout
        });
        
        if (response.ok) {
          console.log(`[useCertificateURL] URL validada com sucesso (tentativa ${attempt})`);
          return;
        }
        
        throw new Error(`HTTP ${response.status}`);
        
      } catch (error) {
        console.warn(`[useCertificateURL] Tentativa ${attempt}/${maxAttempts} falhou:`, error);
        
        if (attempt === maxAttempts) {
          throw new Error(`URL não acessível após ${maxAttempts} tentativas`);
        }
        
        // Esperar antes da próxima tentativa (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  };

  /**
   * Registra uso da URL para analytics
   */
  const trackCertificateURLUsage = (result: URLTransformResult): void => {
    try {
      const trackingData = {
        action: 'certificate_url_transformed',
        source: result.source,
        cached: result.cached,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        page_url: window.location.href
      };

      console.log('[Analytics] Registro de uso de URL de certificado:', trackingData);

      // Integração futura com analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'certificate_url_usage', {
          event_category: 'certificates',
          event_label: result.source,
          value: result.cached ? 1 : 0,
          custom_map: trackingData
        });
      }

    } catch (error) {
      console.warn('[Analytics] Erro ao registrar uso:', error);
    }
  };

  /**
   * Transforma múltiplas URLs em batch
   */
  const transformBatchURLs = useCallback(async (
    urls: string[], 
    options: CertificateURLOptions = {}
  ): Promise<Record<string, string>> => {
    console.log(`[useCertificateURL] Transformando ${urls.length} URLs em batch`);
    
    const results: Record<string, string> = {};
    
    // Processar em paralelo com limite de concorrência
    const chunkSize = 3;
    for (let i = 0; i < urls.length; i += chunkSize) {
      const chunk = urls.slice(i, i + chunkSize);
      
      const chunkPromises = chunk.map(async (url) => {
        try {
          const transformedUrl = await transformCertificateURL(url, { 
            ...options, 
            priority: 'normal' // Batch usa prioridade normal
          });
          return { original: url, transformed: transformedUrl };
        } catch (error) {
          console.error(`[useCertificateURL] Erro ao transformar URL em batch: ${url}`, error);
          return { original: url, transformed: url }; // Fallback
        }
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      
      chunkResults.forEach(({ original, transformed }) => {
        results[original] = transformed;
      });
    }
    
    console.log(`[useCertificateURL] Batch concluído: ${Object.keys(results).length} URLs processadas`);
    return results;
  }, [transformCertificateURL]);

  /**
   * Limpa cache de certificados
   */
  const clearCertificateCache = useCallback(() => {
    urlManager.clearCache();
    setLastTransformation(null);
    toast.success('Cache de URLs limpo com sucesso');
  }, []);

  /**
   * Estatísticas de uso
   */
  const getURLStats = useCallback(() => {
    return {
      cache: urlManager.getCacheStats(),
      lastTransformation,
      isTransforming
    };
  }, [lastTransformation, isTransforming]);

  return {
    transformCertificateURL,
    transformBatchURLs,
    clearCertificateCache,
    getURLStats,
    isTransforming,
    lastTransformation
  };
};
