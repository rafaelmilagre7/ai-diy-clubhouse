import { APP_CONFIG } from '@/config/app';
import { analyticsService } from '@/services/analyticsService';
import { proxyService } from '@/services/proxyService';

export interface URLManagerConfig {
  enableCache: boolean;
  enableAnalytics: boolean;
  enableFallback: boolean;
  enableRealProxy: boolean; // Nova opção para usar proxy real
  cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
}

export interface URLTransformResult {
  url: string;
  source: 'proxy' | 'original' | 'fallback';
  cached: boolean;
  analytics?: {
    trackingId: string;
    category: string;
  };
}

export class URLManager {
  private config: URLManagerConfig;
  private cache = new Map<string, { url: string; timestamp: number; ttl: number }>();
  private readonly SUPABASE_PATTERN = /https:\/\/[^.]+\.supabase\.co/;
  
  constructor(config: URLManagerConfig) {
    this.config = config;
    this.startCacheCleanup();
  }

  /**
   * Transforma uma URL do Supabase para usar o domínio personalizado
   */
  async transformURL(originalUrl: string, type: 'certificate' | 'storage' | 'image' | 'document' = 'storage'): Promise<URLTransformResult> {
    console.log(`[URLManager] Transformando URL tipo: ${type}`, originalUrl);

    // Se não for URL do Supabase, retornar original
    if (!this.SUPABASE_PATTERN.test(originalUrl)) {
      return {
        url: originalUrl,
        source: 'original',
        cached: false
      };
    }

    const cacheKey = `${type}:${originalUrl}`;
    
    // Verificar cache se habilitado
    if (this.config.enableCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log(`[URLManager] URL encontrada em cache: ${cached.url}`);
        return {
          url: cached.url,
          source: 'proxy',
          cached: true,
          analytics: this.generateAnalytics(type)
        };
      }
    }

    try {
      let transformedUrl: string;
      let source: 'proxy' | 'fallback';

      // Usar proxy real se habilitado
      if (this.config.enableRealProxy) {
        const proxyResult = await proxyService.proxyURL(originalUrl, type);
        
        if (proxyResult.success && proxyResult.url) {
          transformedUrl = proxyResult.url;
          source = proxyResult.source;
        } else {
          throw new Error(proxyResult.error || 'Proxy service failed');
        }
      } else {
        // Fallback para método antigo (URL rewrite simples)
        transformedUrl = this.buildProxyURL(originalUrl, type);
        source = 'proxy';
      }
      
      // Salvar no cache
      if (this.config.enableCache) {
        this.saveToCache(cacheKey, transformedUrl, this.getCacheTTL(type));
      }

      // Registrar analytics se habilitado
      if (this.config.enableAnalytics) {
        this.trackURLTransformation(originalUrl, transformedUrl, type);
      }

      console.log(`[URLManager] URL transformada com sucesso: ${transformedUrl}`);

      return {
        url: transformedUrl,
        source,
        cached: false,
        analytics: this.generateAnalytics(type)
      };

    } catch (error) {
      console.error(`[URLManager] Erro ao transformar URL:`, error);
      
      // Fallback para URL original se habilitado
      if (this.config.enableFallback) {
        return {
          url: originalUrl,
          source: 'fallback',
          cached: false
        };
      }
      
      throw error;
    }
  }

  /**
   * Constrói a URL do proxy usando o domínio personalizado (método antigo)
   */
  private buildProxyURL(originalUrl: string, type: string): string {
    const url = new URL(originalUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Extrair bucket e path do arquivo
    const bucket = pathParts[4] || 'storage'; // storage/v1/object/public/{bucket}
    const filePath = pathParts.slice(5).join('/');
    
    // Construir nova URL usando o domínio personalizado
    const baseUrl = APP_CONFIG.getAppDomain();
    const proxyPath = `/api/proxy/${type}/${bucket}/${filePath}`;
    
    // Preservar query parameters se existirem
    const queryString = url.search;
    
    return `${baseUrl}${proxyPath}${queryString}`;
  }

  /**
   * Gerenciamento de cache
   */
  private getFromCache(key: string): { url: string } | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return { url: cached.url };
  }

  private saveToCache(key: string, url: string, ttl: number): void {
    this.cache.set(key, {
      url,
      timestamp: Date.now(),
      ttl
    });
  }

  private getCacheTTL(type: string): number {
    const baseTTL = {
      aggressive: 24 * 60 * 60 * 1000, // 24 horas
      balanced: 12 * 60 * 60 * 1000,   // 12 horas
      conservative: 6 * 60 * 60 * 1000  // 6 horas
    };

    const multiplier = {
      certificate: 2,  // Certificados ficam mais tempo em cache
      image: 1.5,     // Imagens ficam um pouco mais
      document: 1.2,  // Documentos ficam um pouco mais
      storage: 1      // Storage padrão
    };

    return baseTTL[this.config.cacheStrategy] * (multiplier[type] || 1);
  }

  private startCacheCleanup(): void {
    // Limpeza de cache a cada 30 minutos
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now > value.timestamp + value.ttl) {
          this.cache.delete(key);
        }
      }
      console.log(`[URLManager] Cache limpo. Itens restantes: ${this.cache.size}`);
    }, 30 * 60 * 1000);
  }

  /**
   * Analytics e tracking usando o serviço
   */
  private generateAnalytics(type: string) {
    if (!this.config.enableAnalytics) return undefined;
    
    return {
      trackingId: `url_transform_${type}_${Date.now()}`,
      category: `url_proxy_${type}`
    };
  }

  private trackURLTransformation(original: string, transformed: string, type: string): void {
    // Analytics não bloqueante usando o serviço
    setTimeout(() => {
      try {
        console.log(`[Analytics] URL transformada:`, {
          type,
          original: original.substring(0, 50) + '...',
          transformed: transformed.substring(0, 50) + '...',
          timestamp: new Date().toISOString()
        });
        
        // CORRIGIDO: Usar apenas propriedades aceitas pelo analyticsService
        analyticsService.trackURLTransformation({
          type,
          original: original.substring(0, 50) + '...',
          transformed: transformed.substring(0, 50) + '...',
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.warn('[Analytics] Erro ao registrar transformação:', error);
      }
    }, 0);
  }

  /**
   * Métodos utilitários
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[URLManager] Cache limpo manualmente');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      items: Array.from(this.cache.keys()).map(key => ({
        key: key.substring(0, 50) + '...',
        age: Date.now() - (this.cache.get(key)?.timestamp || 0)
      }))
    };
  }

  /**
   * Atualiza configuração do URL Manager
   */
  updateConfig(newConfig: Partial<URLManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[URLManager] Configuração atualizada:', this.config);
    
    // Propagar mudanças para o proxy service se necessário
    if (newConfig.enableFallback !== undefined) {
      proxyService.updateConfig({ enableFallback: newConfig.enableFallback });
    }
  }
}

// Instância singleton configurada com proxy real habilitado
export const urlManager = new URLManager({
  enableCache: true,
  enableAnalytics: true,
  enableFallback: true,
  enableRealProxy: true, // 🚀 Proxy real habilitado!
  cacheStrategy: 'balanced'
});
