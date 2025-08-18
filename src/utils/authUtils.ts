
import { logger } from '@/utils/logger';

/**
 * Redireciona para o domínio principal de forma segura
 */
export const redirectToDomain = (path: string = '/') => {
  try {
    const targetDomain = 'https://app.viverdeia.ai';
    const currentOrigin = window.location.origin;
    
    // Evitar redirecionamento se já estiver no domínio correto
    if (currentOrigin === targetDomain) {
      logger.info("Já no domínio correto, não redirecionando", {
        component: 'AUTH_UTILS'
      });
      return;
    }
    
    // Sanitizar o path para evitar ataques de redirecionamento
    const safePath = path.startsWith('/') ? path : '/' + path;
    const redirectUrl = `${targetDomain}${safePath}`;
    
    logger.info("Redirecionando para domínio principal", {
      from: currentOrigin,
      to: redirectUrl,
      component: 'AUTH_UTILS'
    });
    
    // Usar replace para evitar volta no histórico
    window.location.replace(redirectUrl);
    
  } catch (error) {
    logger.error("Erro no redirecionamento de domínio", {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      component: 'AUTH_UTILS'
    });
  }
};

/**
 * Valida se uma URL é segura para redirecionamento
 */
export const isValidRedirectUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url, window.location.origin);
    
    // Permitir apenas URLs do mesmo domínio ou domínios confiáveis
    const allowedDomains = [
      'app.viverdeia.ai',
      'viverdeia.ai',
      'localhost',
      '127.0.0.1'
    ];
    
    const hostname = urlObj.hostname.toLowerCase();
    const isAllowed = allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    // Verificar protocolo seguro
    const isSecureProtocol = ['http:', 'https:'].includes(urlObj.protocol);
    
    return isAllowed && isSecureProtocol;
  } catch {
    return false;
  }
};

/**
 * Gera um nonce seguro para CSP
 */
export const generateSecureNonce = (): string => {
  try {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback para ambientes sem crypto API
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
};

/**
 * Verifica se o ambiente atual é seguro
 */
export const isSecureEnvironment = (): boolean => {
  try {
    // Verificar HTTPS em produção
    if (import.meta.env.PROD) {
      return window.location.protocol === 'https:';
    }
    
    // Em desenvolvimento, permitir HTTP apenas em localhost
    if (import.meta.env.DEV) {
      const hostname = window.location.hostname;
      return hostname === 'localhost' || 
             hostname === '127.0.0.1' || 
             hostname.startsWith('localhost:') ||
             window.location.protocol === 'https:';
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Headers de segurança para requisições
 */
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
};
