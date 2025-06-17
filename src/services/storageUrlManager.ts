
import { urlManager } from '@/services/urlManager';

export type StorageURLType = 'image' | 'document' | 'certificate' | 'storage';

export interface StorageURLOptions {
  enableTracking?: boolean;
  priority?: 'low' | 'normal' | 'high';
  maxRetries?: number;
}

export interface StorageURLResult {
  optimizedUrl: string;
  success: boolean;
  error?: string;
}

export interface StorageURLBatchItem {
  url: string;
  type: StorageURLType;
}

class StorageURLManager {
  private static instance: StorageURLManager;
  private cache = new Map<string, StorageURLResult>();
  private stats = {
    total: 0,
    cached: 0,
    optimized: 0,
    failed: 0
  };

  private constructor() {}

  public static getInstance(): StorageURLManager {
    if (!StorageURLManager.instance) {
      StorageURLManager.instance = new StorageURLManager();
    }
    return StorageURLManager.instance;
  }

  /**
   * Otimiza URL de imagem usando o domínio personalizado
   */
  public async optimizeImageURL(
    originalUrl: string,
    options: StorageURLOptions = {}
  ): Promise<StorageURLResult> {
    const cacheKey = `image_${originalUrl}`;
    
    if (this.cache.has(cacheKey)) {
      this.stats.cached++;
      return this.cache.get(cacheKey)!;
    }

    try {
      // Usar URLManager para transformar a URL
      const optimizedUrl = this.transformSupabaseUrl(originalUrl);
      
      const result: StorageURLResult = {
        optimizedUrl,
        success: true
      };
      
      this.cache.set(cacheKey, result);
      this.stats.optimized++;
      this.stats.total++;
      
      return result;
    } catch (error) {
      const result: StorageURLResult = {
        optimizedUrl: originalUrl,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      
      this.stats.failed++;
      this.stats.total++;
      
      return result;
    }
  }

  /**
   * Otimiza URL de documento
   */
  public async optimizeDocumentURL(
    originalUrl: string,
    options: StorageURLOptions = {}
  ): Promise<StorageURLResult> {
    const cacheKey = `document_${originalUrl}`;
    
    if (this.cache.has(cacheKey)) {
      this.stats.cached++;
      return this.cache.get(cacheKey)!;
    }

    try {
      const optimizedUrl = this.transformSupabaseUrl(originalUrl);
      
      const result: StorageURLResult = {
        optimizedUrl,
        success: true
      };
      
      this.cache.set(cacheKey, result);
      this.stats.optimized++;
      this.stats.total++;
      
      return result;
    } catch (error) {
      const result: StorageURLResult = {
        optimizedUrl: originalUrl,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      
      this.stats.failed++;
      this.stats.total++;
      
      return result;
    }
  }

  /**
   * Otimiza URL de certificado
   */
  public async optimizeCertificateURL(
    originalUrl: string,
    options: StorageURLOptions = {}
  ): Promise<StorageURLResult> {
    const cacheKey = `certificate_${originalUrl}`;
    
    if (this.cache.has(cacheKey)) {
      this.stats.cached++;
      return this.cache.get(cacheKey)!;
    }

    try {
      const optimizedUrl = this.transformSupabaseUrl(originalUrl);
      
      const result: StorageURLResult = {
        optimizedUrl,
        success: true
      };
      
      this.cache.set(cacheKey, result);
      this.stats.optimized++;
      this.stats.total++;
      
      return result;
    } catch (error) {
      const result: StorageURLResult = {
        optimizedUrl: originalUrl,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      
      this.stats.failed++;
      this.stats.total++;
      
      return result;
    }
  }

  /**
   * Otimiza URL de storage genérica
   */
  public async optimizeStorageURL(
    originalUrl: string,
    options: StorageURLOptions = {}
  ): Promise<StorageURLResult> {
    const cacheKey = `storage_${originalUrl}`;
    
    if (this.cache.has(cacheKey)) {
      this.stats.cached++;
      return this.cache.get(cacheKey)!;
    }

    try {
      const optimizedUrl = this.transformSupabaseUrl(originalUrl);
      
      const result: StorageURLResult = {
        optimizedUrl,
        success: true
      };
      
      this.cache.set(cacheKey, result);
      this.stats.optimized++;
      this.stats.total++;
      
      return result;
    } catch (error) {
      const result: StorageURLResult = {
        optimizedUrl: originalUrl,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      
      this.stats.failed++;
      this.stats.total++;
      
      return result;
    }
  }

  /**
   * Otimiza múltiplas URLs em batch
   */
  public async optimizeBatchURLs(
    items: StorageURLBatchItem[],
    options: StorageURLOptions = {}
  ): Promise<Record<string, StorageURLResult>> {
    const results: Record<string, StorageURLResult> = {};
    
    for (const item of items) {
      switch (item.type) {
        case 'image':
          results[item.url] = await this.optimizeImageURL(item.url, options);
          break;
        case 'document':
          results[item.url] = await this.optimizeDocumentURL(item.url, options);
          break;
        case 'certificate':
          results[item.url] = await this.optimizeCertificateURL(item.url, options);
          break;
        case 'storage':
        default:
          results[item.url] = await this.optimizeStorageURL(item.url, options);
          break;
      }
    }
    
    return results;
  }

  /**
   * Transforma URL do Supabase para usar domínio personalizado
   */
  private transformSupabaseUrl(originalUrl: string): string {
    if (!originalUrl || !originalUrl.includes('supabase')) {
      return originalUrl;
    }

    try {
      const url = new URL(originalUrl);
      
      // Se for URL do Supabase Storage, usar domínio personalizado
      if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/')) {
        const baseUrl = urlManager.getCanonicalUrl('');
        const storagePath = url.pathname.replace('/storage/v1/object/public/', '/storage/');
        return `${baseUrl}${storagePath}${url.search}`;
      }
      
      return originalUrl;
    } catch {
      return originalUrl;
    }
  }

  /**
   * Limpa cache por tipo
   */
  public clearCacheForType(type: StorageURLType): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${type}_`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Obtém estatísticas por tipo
   */
  public getStatsByType(): Record<string, number> {
    return { ...this.stats };
  }

  /**
   * Limpa todo o cache
   */
  public clearAllCache(): void {
    this.cache.clear();
    this.stats = {
      total: 0,
      cached: 0,
      optimized: 0,
      failed: 0
    };
  }
}

// Instância singleton para uso global
export const storageUrlManager = StorageURLManager.getInstance();
