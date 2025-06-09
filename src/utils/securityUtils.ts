
// Utilitários de segurança para o frontend

// Sanitizar dados para logs (remover informações sensíveis)
export const sanitizeForLogging = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeForLogging);
  }

  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'email', 'phone', 
    'cpf', 'cnpj', 'api_key', 'access_token', 'refresh_token'
  ];

  const sanitized: any = {};

  Object.keys(data).forEach(key => {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      sanitized[key] = sanitizeForLogging(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  });

  return sanitized;
};

// Validar se uma string contém apenas caracteres seguros
export const isSafeString = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  
  // Regex para detectar possíveis ataques XSS básicos
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi
  ];

  return !dangerousPatterns.some(pattern => pattern.test(str));
};

// Escape de HTML para prevenir XSS
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Validar formato de email de forma segura
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5322 limit
};

// Gerar hash simples para identificação (não criptográfico)
export const generateSimpleHash = (input: string): string => {
  let hash = 0;
  if (input.length === 0) return hash.toString();
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

// Limpar dados sensíveis da memória (best effort)
export const clearSensitiveData = (obj: any): void => {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = '';
      } else if (typeof obj[key] === 'object') {
        clearSensitiveData(obj[key]);
      }
    });
  }
};

// Rate limiting simples no frontend
const rateLimitMap = new Map<string, number[]>();

export const checkRateLimit = (
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, []);
  }
  
  const requests = rateLimitMap.get(identifier)!;
  
  // Remover requisições antigas
  const validRequests = requests.filter(time => time > windowStart);
  
  if (validRequests.length >= maxRequests) {
    return false; // Rate limit excedido
  }
  
  // Adicionar nova requisição
  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);
  
  return true; // OK para prosseguir
};

// Detectar ambiente suspeito
export const detectSuspiciousEnvironment = (): string[] => {
  const warnings: string[] = [];
  
  // Verificar se está em desenvolvimento mas com dados de produção
  if (process.env.NODE_ENV === 'development') {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      warnings.push('Development mode em ambiente não local');
    }
  }
  
  // Verificar extensões suspeitas do navegador
  if (typeof (window as any).chrome !== 'undefined' && (window as any).chrome.runtime) {
    warnings.push('Extensões do Chrome detectadas');
  }
  
  // Verificar se DevTools estão abertas (apenas em produção)
  if (process.env.NODE_ENV === 'production') {
    const threshold = 160;
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      warnings.push('DevTools potencialmente abertas');
    }
  }
  
  return warnings;
};
