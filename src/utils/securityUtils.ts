
import { logger } from './logger';

// Sanitizar dados para logs (remover informações sensíveis)
export const sanitizeForLogging = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth', 'credential',
    'email', 'phone', 'cpf', 'rg', 'api_key', 'access_token',
    'refresh_token', 'session_id'
  ];

  const sanitized = { ...data };

  const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const keyLower = key.toLowerCase();
      
      if (sensitiveFields.some(field => keyLower.includes(field))) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        result[key] = sanitizeObject(value);
      } else if (typeof value === 'string' && value.length > 100) {
        // Truncar strings muito longas
        result[key] = value.substring(0, 100) + '...';
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  return sanitizeObject(sanitized);
};

// Detectar tentativas de injeção
export const detectInjectionAttempts = (input: string): boolean => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /expression\s*\(/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
};

// Validar origem da requisição
export const isValidOrigin = (origin: string): boolean => {
  const allowedOrigins = [
    'https://app.viverdeia.ai',
    'https://viverdeia.ai',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];

  return allowedOrigins.includes(origin) || 
         (process.env.NODE_ENV === 'development' && origin.includes('localhost'));
};

// Gerar hash simples para identificadores
export const hashIdentifier = (identifier: string): string => {
  return identifier.substring(0, 8) + '***';
};

// Verificar se está em ambiente de produção
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production' || 
         window.location.hostname.includes('viverdeia.ai');
};

// Verificar se recursos de teste devem estar disponíveis
export const canShowTestFeatures = (): boolean => {
  if (isProduction()) {
    logger.warn("Tentativa de usar features de teste em produção", {
      component: 'SECURITY_UTILS',
      hostname: window.location.hostname
    });
    return false;
  }
  return true;
};
