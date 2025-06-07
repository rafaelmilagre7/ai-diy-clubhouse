
import { APP_CONFIG } from '@/config/app';

export interface ProxyResponse {
  success: boolean;
  url?: string;
  error?: string;
  source: 'proxy' | 'fallback';
  cached?: boolean;
}

export interface ProxyConfig {
  enableFallback: boolean;
  timeout: number;
  retries: number;
}

/**
 * Serviço para usar o proxy real do Supabase Edge Function
 */
export class ProxyService {
  private config: ProxyConfig;
  private baseUrl: string;

  constructor(config: ProxyConfig = {
    enableFallback: true,
    timeout: 10000,
    retries: 2
  }) {
    this.config = config;
    this.baseUrl = APP_CONFIG.getAppDomain();
  }

  /**
   * Usa o proxy real para transformar URLs
   */
  async proxyURL(
    originalUrl: string, 
    type: 'image' | 'document' | 'storage' | 'certificate'
  ): Promise<ProxyResponse> {
    console.log(`[ProxyService] Proxying ${type} URL:`, originalUrl);

    // Verificar se é URL do Supabase
    if (!this.isSupabaseURL(originalUrl)) {
      return {
        success: true,
        url: originalUrl,
        source: 'fallback'
      };
    }

    try {
      // Extrair bucket e path da URL original
      const { bucket, path } = this.parseSupabaseURL(originalUrl);
      
      // Construir URL do proxy
      const proxyUrl = `${this.baseUrl}/functions/v1/storage-proxy/${type}/${bucket}/${path}`;
      
      // Testar se o proxy está funcionando
      const isProxyWorking = await this.testProxyHealth(proxyUrl);
      
      if (isProxyWorking) {
        console.log(`[ProxyService] Proxy URL created:`, proxyUrl);
        return {
          success: true,
          url: proxyUrl,
          source: 'proxy'
        };
      } else {
        throw new Error('Proxy health check failed');
      }

    } catch (error) {
      console.warn(`[ProxyService] Proxy failed for ${type}:`, error);
      
      if (this.config.enableFallback) {
        return {
          success: true,
          url: originalUrl,
          source: 'fallback',
          error: error.message
        };
      } else {
        return {
          success: false,
          error: error.message,
          source: 'proxy'
        };
      }
    }
  }

  /**
   * Verifica se é URL do Supabase
   */
  private isSupabaseURL(url: string): boolean {
    return url.includes('zotzvtepvpnkcoobdubt.supabase.co');
  }

  /**
   * Extrai bucket e path de uma URL do Supabase Storage
   */
  private parseSupabaseURL(url: string): { bucket: string; path: string } {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      // Formato esperado: /storage/v1/object/public/{bucket}/{path}
      if (pathParts.length >= 5 && pathParts[0] === 'storage') {
        const bucket = pathParts[4];
        const path = pathParts.slice(5).join('/');
        
        // Preservar query parameters se existirem
        const queryString = urlObj.search;
        const finalPath = path + queryString;
        
        return { bucket, path: finalPath };
      }
      
      throw new Error('Invalid Supabase storage URL format');
    } catch (error) {
      throw new Error(`Failed to parse Supabase URL: ${error.message}`);
    }
  }

  /**
   * Testa se o proxy está funcionando
   */
  private async testProxyHealth(proxyUrl: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos timeout

      const response = await fetch(proxyUrl, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      // Aceitar códigos 200-299 e 404 (arquivo não encontrado é OK para teste)
      return response.status < 500;
      
    } catch (error) {
      console.warn('[ProxyService] Health check failed:', error);
      return false;
    }
  }

  /**
   * Atualiza configuração do proxy
   */
  updateConfig(newConfig: Partial<ProxyConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[ProxyService] Configuration updated:', this.config);
  }
}

// Instância singleton
export const proxyService = new ProxyService();
