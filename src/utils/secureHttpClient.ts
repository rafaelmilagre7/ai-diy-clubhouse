
import { logger } from './logger';
import { securityHeaders } from './securityHeaders';

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

class SecureHttpClient {
  private static instance: SecureHttpClient;
  private readonly defaultTimeout = 30000; // 30 segundos
  private readonly defaultRetries = 3;
  private readonly defaultRetryDelay = 1000; // 1 segundo

  private constructor() {}

  static getInstance(): SecureHttpClient {
    if (!SecureHttpClient.instance) {
      SecureHttpClient.instance = new SecureHttpClient();
    }
    return SecureHttpClient.instance;
  }

  async request(url: string, config: RequestConfig = {}): Promise<Response> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      ...fetchConfig
    } = config;

    // Aplicar headers de segurança
    const secureConfig = securityHeaders.enhanceFetch(url, fetchConfig);
    
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...secureConfig,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Log da requisição bem-sucedida
        logger.debug('HTTP request successful', {
          component: 'SECURE_HTTP_CLIENT',
          url: url.substring(0, 100),
          status: response.status,
          attempt: attempt + 1
        });

        return response;
      } catch (error) {
        lastError = error as Error;
        
        logger.warn(`HTTP request failed (attempt ${attempt + 1}/${retries + 1})`, {
          component: 'SECURE_HTTP_CLIENT',
          url: url.substring(0, 100),
          error: lastError.message,
          attempt: attempt + 1
        });

        // Se não é a última tentativa, aguardar antes de tentar novamente
        if (attempt < retries) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // Backoff exponencial
        }
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    logger.error('HTTP request failed after all retries', {
      component: 'SECURE_HTTP_CLIENT',
      url: url.substring(0, 100),
      totalAttempts: retries + 1,
      finalError: lastError.message
    });

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Métodos de conveniência
  async get(url: string, config?: RequestConfig) {
    return this.request(url, { ...config, method: 'GET' });
  }

  async post(url: string, data?: any, config?: RequestConfig) {
    return this.request(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      }
    });
  }

  async put(url: string, data?: any, config?: RequestConfig) {
    return this.request(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      }
    });
  }

  async delete(url: string, config?: RequestConfig) {
    return this.request(url, { ...config, method: 'DELETE' });
  }
}

export const secureHttpClient = SecureHttpClient.getInstance();
