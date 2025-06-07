import { urlManager, URLTransformResult } from '@/services/urlManager';
import { analyticsService } from '@/services/analyticsService';

export interface StorageURLOptions {
  enableTracking?: boolean;
  priority?: 'high' | 'normal' | 'low';
  retryAttempts?: number;
  cacheStrategy?: 'aggressive' | 'balanced' | 'conservative';
}

export interface StorageURLResult extends URLTransformResult {
  type: 'image' | 'document' | 'storage' | 'certificate';
  originalUrl: string;
  optimizedUrl: string;
}

/**
 * Serviço especializado para otimização de URLs de storage
 * Agora usa o proxy real via Edge Function do Supabase
 */
export class StorageURLManager {
  /**
   * Otimiza URL de certificado usando o proxy real
   */
  async optimizeCertificateURL(
    originalUrl: string, 
    options: StorageURLOptions = {}
  ): Promise<StorageURLResult> {
    const {
      enableTracking = true,
      priority = 'high'
    } = options;

    if (!originalUrl) {
      throw new Error('URL do certificado é obrigatória');
    }

    try {
      console.log(`[StorageURLManager] Otimizando URL de certificado (prioridade: ${priority}):`, originalUrl);

      const result = await urlManager.transformURL(originalUrl, 'certificate');
      
      if (enableTracking && result.analytics) {
        this.trackCertificateURLUsage(result, originalUrl);
      }

      return {
        ...result,
        type: 'certificate',
        originalUrl,
        optimizedUrl: result.url
      };

    } catch (error) {
      console.error('[StorageURLManager] Erro ao otimizar URL de certificado:', error);
      
      return {
        url: originalUrl,
        source: 'fallback',
        cached: false,
        type: 'certificate',
        originalUrl,
        optimizedUrl: originalUrl
      };
    }
  }

  /**
   * Otimiza URL de imagem usando o proxy real
   */
  async optimizeImageURL(
    originalUrl: string, 
    options: StorageURLOptions = {}
  ): Promise<StorageURLResult> {
    const {
      enableTracking = true,
      priority = 'normal'
    } = options;

    if (!originalUrl) {
      throw new Error('URL da imagem é obrigatória');
    }

    try {
      console.log(`[StorageURLManager] Otimizando URL de imagem (prioridade: ${priority}):`, originalUrl);

      const result = await urlManager.transformURL(originalUrl, 'image');
      
      if (enableTracking && result.analytics) {
        this.trackImageURLUsage(result, originalUrl);
      }

      return {
        ...result,
        type: 'image',
        originalUrl,
        optimizedUrl: result.url
      };

    } catch (error) {
      console.error('[StorageURLManager] Erro ao otimizar URL de imagem:', error);
      
      return {
        url: originalUrl,
        source: 'fallback',
        cached: false,
        type: 'image',
        originalUrl,
        optimizedUrl: originalUrl
      };
    }
  }

  /**
   * Otimiza URL de documento usando o proxy real
   */
  async optimizeDocumentURL(
    originalUrl: string, 
    options: StorageURLOptions = {}
  ): Promise<StorageURLResult> {
    const {
      enableTracking = true,
      priority = 'normal'
    } = options;

    if (!originalUrl) {
      throw new Error('URL do documento é obrigatória');
    }

    try {
      console.log(`[StorageURLManager] Otimizando URL de documento (prioridade: ${priority}):`, originalUrl);

      const result = await urlManager.transformURL(originalUrl, 'document');
      
      if (enableTracking && result.analytics) {
        this.trackDocumentURLUsage(result, originalUrl);
      }

      return {
        ...result,
        type: 'document',
        originalUrl,
        optimizedUrl: result.url
      };

    } catch (error) {
      console.error('[StorageURLManager] Erro ao otimizar URL de documento:', error);
      
      return {
        url: originalUrl,
        source: 'fallback',
        cached: false,
        type: 'document',
        originalUrl,
        optimizedUrl: originalUrl
      };
    }
  }

  /**
   * Otimiza URL de storage geral usando o proxy real
   */
  async optimizeStorageURL(
    originalUrl: string, 
    options: StorageURLOptions = {}
  ): Promise<StorageURLResult> {
    const {
      enableTracking = true,
      priority = 'normal'
    } = options;

    if (!originalUrl) {
      throw new Error('URL de storage é obrigatória');
    }

    try {
      console.log(`[StorageURLManager] Otimizando URL de storage (prioridade: ${priority}):`, originalUrl);

      const result = await urlManager.transformURL(originalUrl, 'storage');
      
      if (enableTracking && result.analytics) {
        this.trackStorageURLUsage(result, originalUrl);
      }

      return {
        ...result,
        type: 'storage',
        originalUrl,
        optimizedUrl: result.url
      };

    } catch (error) {
      console.error('[StorageURLManager] Erro ao otimizar URL de storage:', error);
      
      return {
        url: originalUrl,
        source: 'fallback',
        cached: false,
        type: 'storage',
        originalUrl,
        optimizedUrl: originalUrl
      };
    }
  }

  /**
   * Otimiza múltiplas URLs em batch de forma eficiente
   */
  async optimizeBatchURLs(
    urls: { url: string; type: 'image' | 'document' | 'storage' | 'certificate' }[],
    options: StorageURLOptions = {}
  ): Promise<Record<string, StorageURLResult>> {
    console.log(`[StorageURLManager] Otimizando ${urls.length} URLs em batch`);
    
    const results: Record<string, StorageURLResult> = {};
    
    const chunkSize = 3;
    for (let i = 0; i < urls.length; i += chunkSize) {
      const chunk = urls.slice(i, i + chunkSize);
      
      const chunkPromises = chunk.map(async ({ url, type }) => {
        try {
          let result: StorageURLResult;
          
          switch (type) {
            case 'certificate':
              result = await this.optimizeCertificateURL(url, { ...options, priority: 'high' });
              break;
            case 'image':
              result = await this.optimizeImageURL(url, { ...options, priority: 'normal' });
              break;
            case 'document':
              result = await this.optimizeDocumentURL(url, { ...options, priority: 'normal' });
              break;
            case 'storage':
              result = await this.optimizeStorageURL(url, { ...options, priority: 'normal' });
              break;
            default:
              throw new Error(`Tipo de URL não suportado: ${type}`);
          }
          
          return { original: url, result };
        } catch (error) {
          console.error(`[StorageURLManager] Erro ao otimizar URL em batch: ${url}`, error);
          return { 
            original: url, 
            result: {
              url,
              source: 'fallback' as const,
              cached: false,
              type,
              originalUrl: url,
              optimizedUrl: url
            }
          };
        }
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      
      chunkResults.forEach(({ original, result }) => {
        results[original] = result;
      });
    }
    
    console.log(`[StorageURLManager] Batch concluído: ${Object.keys(results).length} URLs processadas`);
    return results;
  }

  /**
   * Analytics para URLs de certificados
   */
  private trackCertificateURLUsage(result: URLTransformResult, originalUrl: string): void {
    try {
      const trackingData = {
        type: 'certificate',
        source: result.source,
        cached: result.cached,
        timestamp: new Date().toISOString(),
        original: originalUrl.substring(0, 50) + '...',
        transformed: result.url.substring(0, 50) + '...'
      };

      analyticsService.trackURLTransformation(trackingData);
    } catch (error) {
      console.warn('[StorageURLManager] Erro ao registrar analytics de certificado:', error);
    }
  }

  private trackImageURLUsage(result: URLTransformResult, originalUrl: string): void {
    try {
      const trackingData = {
        type: 'image',
        source: result.source,
        cached: result.cached,
        timestamp: new Date().toISOString(),
        original: originalUrl.substring(0, 50) + '...',
        transformed: result.url.substring(0, 50) + '...'
      };

      analyticsService.trackURLTransformation(trackingData);
    } catch (error) {
      console.warn('[StorageURLManager] Erro ao registrar analytics de imagem:', error);
    }
  }

  private trackDocumentURLUsage(result: URLTransformResult, originalUrl: string): void {
    try {
      const trackingData = {
        type: 'document',
        source: result.source,
        cached: result.cached,
        timestamp: new Date().toISOString(),
        original: originalUrl.substring(0, 50) + '...',
        transformed: result.url.substring(0, 50) + '...'
      };

      analyticsService.trackURLTransformation(trackingData);
    } catch (error) {
      console.warn('[StorageURLManager] Erro ao registrar analytics de documento:', error);
    }
  }

  private trackStorageURLUsage(result: URLTransformResult, originalUrl: string): void {
    try {
      const trackingData = {
        type: 'storage',
        source: result.source,
        cached: result.cached,
        timestamp: new Date().toISOString(),
        original: originalUrl.substring(0, 50) + '...',
        transformed: result.url.substring(0, 50) + '...'
      };

      analyticsService.trackURLTransformation(trackingData);
    } catch (error) {
      console.warn('[StorageURLManager] Erro ao registrar analytics de storage:', error);
    }
  }

  /**
   * Limpa cache para tipo específico de storage
   */
  clearCacheForType(type: 'image' | 'document' | 'storage' | 'certificate'): void {
    urlManager.clearCache();
    console.log(`[StorageURLManager] Cache limpo para tipo: ${type}`);
  }

  /**
   * Estatísticas de uso por tipo
   */
  getStatsByType() {
    return {
      cache: urlManager.getCacheStats(),
      timestamp: new Date().toISOString()
    };
  }
}

// Instância singleton
export const storageUrlManager = new StorageURLManager();
