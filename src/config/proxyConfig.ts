
import { APP_CONFIG } from './app';

export interface ProxyEndpoint {
  path: string;
  description: string;
  cacheTTL: number; // em segundos
  maxRetries: number;
  timeout: number; // em milissegundos
}

export const PROXY_CONFIG = {
  // Configuração base
  baseUrl: APP_CONFIG.getAppDomain(),
  version: 'v1',
  
  // Endpoints do proxy
  endpoints: {
    certificate: {
      path: '/api/proxy/certificate',
      description: 'Proxy para certificados PDF',
      cacheTTL: 24 * 60 * 60, // 24 horas
      maxRetries: 3,
      timeout: 30000 // 30 segundos
    } as ProxyEndpoint,
    
    storage: {
      path: '/api/proxy/storage', 
      description: 'Proxy para arquivos de storage geral',
      cacheTTL: 12 * 60 * 60, // 12 horas
      maxRetries: 2,
      timeout: 15000 // 15 segundos
    } as ProxyEndpoint,
    
    image: {
      path: '/api/proxy/image',
      description: 'Proxy para imagens otimizadas',
      cacheTTL: 18 * 60 * 60, // 18 horas
      maxRetries: 2,
      timeout: 10000 // 10 segundos
    } as ProxyEndpoint,
    
    document: {
      path: '/api/proxy/document',
      description: 'Proxy para documentos',
      cacheTTL: 15 * 60 * 60, // 15 horas
      maxRetries: 2,
      timeout: 20000 // 20 segundos
    } as ProxyEndpoint
  },

  // Configurações de segurança
  security: {
    enableReferrerCheck: true,
    allowedReferrers: [
      'app.viverdeia.ai',
      'viverdeia.ai',
      'localhost:3000', // Para desenvolvimento
      'localhost:5173'  // Para Vite dev
    ],
    enableCORS: true,
    corsOrigins: [
      'https://app.viverdeia.ai',
      'https://viverdeia.ai',
      'http://localhost:3000',
      'http://localhost:5173'
    ]
  },

  // Configurações de cache
  cache: {
    enabled: true,
    defaultTTL: 12 * 60 * 60, // 12 horas padrão
    maxAge: 7 * 24 * 60 * 60, // 7 dias máximo
    swr: true, // Stale While Revalidate
    
    // Headers de cache
    headers: {
      'Cache-Control': 'public, max-age=43200, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, max-age=31536000', // 1 ano para CDN
      'Vary': 'Accept-Encoding'
    }
  },

  // Configurações de analytics
  analytics: {
    enabled: true,
    trackingEvents: [
      'proxy_request',
      'proxy_cache_hit',
      'proxy_cache_miss',
      'proxy_error',
      'proxy_fallback'
    ],
    anonymizeIP: true,
    sampleRate: 0.1 // 10% das requisições
  },

  // Limites e throttling
  limits: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    requestsPerMinute: 120,
    concurrentRequests: 10,
    
    // Rate limiting por tipo
    rateLimits: {
      certificate: { requests: 30, window: 60 }, // 30 req/min
      image: { requests: 60, window: 60 },       // 60 req/min
      storage: { requests: 45, window: 60 },     // 45 req/min
      document: { requests: 40, window: 60 }     // 40 req/min
    }
  },

  // Configurações de retry e fallback
  resilience: {
    retryDelay: 1000, // 1 segundo base
    retryBackoffMultiplier: 2,
    maxRetryDelay: 10000, // 10 segundos máximo
    
    fallback: {
      enabled: true,
      redirectToOriginal: true,
      showFallbackMessage: false
    },
    
    healthCheck: {
      enabled: true,
      interval: 30000, // 30 segundos
      endpoint: '/api/health'
    }
  }
};

// Funções utilitárias
export const getProxyURL = (type: keyof typeof PROXY_CONFIG.endpoints, bucket: string, path: string): string => {
  const endpoint = PROXY_CONFIG.endpoints[type];
  if (!endpoint) {
    throw new Error(`Tipo de proxy desconhecido: ${type}`);
  }
  
  return `${PROXY_CONFIG.baseUrl}${endpoint.path}/${bucket}/${path}`;
};

export const getCacheConfig = (type: keyof typeof PROXY_CONFIG.endpoints) => {
  const endpoint = PROXY_CONFIG.endpoints[type];
  return {
    ttl: endpoint?.cacheTTL || PROXY_CONFIG.cache.defaultTTL,
    headers: PROXY_CONFIG.cache.headers
  };
};

export const getRateLimitConfig = (type: keyof typeof PROXY_CONFIG.endpoints) => {
  return PROXY_CONFIG.limits.rateLimits[type] || { requests: 30, window: 60 };
};

// Validação de configuração
export const validateProxyConfig = (): boolean => {
  try {
    // Verificar se todos os endpoints têm configuração válida
    Object.entries(PROXY_CONFIG.endpoints).forEach(([key, config]) => {
      if (!config.path || !config.description || !config.cacheTTL) {
        throw new Error(`Configuração inválida para endpoint: ${key}`);
      }
    });
    
    // Verificar se o domínio base está configurado
    if (!PROXY_CONFIG.baseUrl) {
      throw new Error('URL base do proxy não configurada');
    }
    
    console.log('[ProxyConfig] Configuração validada com sucesso');
    return true;
    
  } catch (error) {
    console.error('[ProxyConfig] Erro na validação:', error);
    return false;
  }
};

// Log da configuração (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('[ProxyConfig] Configuração carregada:', {
    baseUrl: PROXY_CONFIG.baseUrl,
    endpoints: Object.keys(PROXY_CONFIG.endpoints),
    cacheEnabled: PROXY_CONFIG.cache.enabled,
    analyticsEnabled: PROXY_CONFIG.analytics.enabled
  });
}
