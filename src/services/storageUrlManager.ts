
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
 * Extende o URLManager com funcionalidades específicas para diferentes tipos de arquivos
 */
export class StorageURLManager {
  /**
   * Otimiza URL de imagem usando o domínio personalizado
   */
  async optimizeImageURL(
    originalUrl: string, 
    options: StorageURLOptions = {}
  ): Promise<StorageURLResult> {
    const {
      enableTracking = true,
      priority = 'normal',
      retryAttempts = 2
    } = options;

    if (!originalUrl) {
      throw new Error('URL da imagem é obrigatória');
    }

    try {
      console.log(`[StorageURLManager] Otimizando URL de imagem (prioridade: ${priority}):`, originalUrl);

      const result = urlManager.transformURL(originalUrl, 'image');
      
      // Analytics específico para imagens
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
      
      // Fallback seguro para URL original
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
   * Otimiza URL de documento usando o domínio personalizado
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

      const result = urlManager.transformURL(originalUrl, 'document');
      
      // Analytics específico para documentos
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
      
      // Fallback seguro para URL original
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
   * Otimiza URL de storage geral usando o domínio personalizado
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

      const result = urlManager.transformURL(originalUrl, 'storage');
      
      // Analytics específico para storage geral
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
      
      // Fallback seguro para URL original
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
    urls: { url: string; type: 'image' | 'document' | 'storage' }[],
    options: StorageURLOptions = {}
  ): Promise<Record<string, StorageURLResult>> {
    console.log(`[StorageURLManager] Otimizando ${urls.length} URLs em batch`);
    
    const results: Record<string, StorageURLResult> = {};
    
    // Processar em paralelo com limite de concorrência
    const chunkSize = 3;
    for (let i = 0; i < urls.length; i += chunkSize) {
      const chunk = urls.slice(i, i + chunkSize);
      
      const chunkPromises = chunk.map(async ({ url, type }) => {
        try {
          let result: StorageURLResult;
          
          switch (type) {
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
   * Analytics para URLs de imagens
   */
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

  /**
   * Analytics para URLs de documentos
   */
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

  /**
   * Analytics para URLs de storage geral
   */
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
    // Usar o método do URLManager que já existe
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
