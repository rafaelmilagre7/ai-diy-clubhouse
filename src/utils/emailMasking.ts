/**
 * Sistema de mascaramento de emails para logs seguros
 * Garante que emails não apareçam completos nos logs do console
 */

const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

/**
 * Mascara um email mantendo apenas formato básico
 * user@domain.com → u***@***.com
 */
export const maskEmail = (email: string): string => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return '[email protegido]';
  }

  const [localPart, domain] = email.split('@');
  
  // Mascarar parte local
  const maskedLocal = localPart.length <= 1 
    ? '*' 
    : localPart[0] + '***';
  
  // Mascarar domínio
  const domainParts = domain.split('.');
  const maskedDomain = domainParts.length > 1 
    ? '***.' + domainParts[domainParts.length - 1] 
    : '***';
  
  return `${maskedLocal}@${maskedDomain}`;
};

/**
 * Processa texto/objeto e mascara todos os emails encontrados
 */
export const maskEmailsInText = (input: any): any => {
  if (typeof input === 'string') {
    // Regex para encontrar emails no texto
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return input.replace(emailRegex, (email) => maskEmail(email));
  }
  
  if (Array.isArray(input)) {
    return input.map(item => maskEmailsInText(item));
  }
  
  if (input && typeof input === 'object') {
    const masked: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Verificar se é campo de email
      if (key.toLowerCase().includes('email') && typeof value === 'string') {
        masked[key] = maskEmail(value);
      } else {
        // Só fazer recursão se o valor não for string (para evitar loop infinito)
        masked[key] = typeof value === 'string' ? value : maskEmailsInText(value);
      }
    }
    return masked;
  }
  
  return input;
};

/**
 * Interceptor de console que mascara emails automaticamente
 */
export const setupEmailMaskingInterceptor = () => {
  if (typeof window === 'undefined') return;
  
  // Salvar métodos originais
  const originalConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console)
  };
  
  // Função para processar argumentos
  const processArgs = (args: any[]) => {
    return args.map(arg => maskEmailsInText(arg));
  };
  
  // Interceptar métodos de console
  console.log = (...args: any[]) => {
    const maskedArgs = processArgs(args);
    originalConsole.log(...maskedArgs);
  };
  
  console.info = (...args: any[]) => {
    const maskedArgs = processArgs(args);
    originalConsole.info(...maskedArgs);
  };
  
  console.warn = (...args: any[]) => {
    const maskedArgs = processArgs(args);
    originalConsole.warn(...maskedArgs);
  };
  
  console.error = (...args: any[]) => {
    const maskedArgs = processArgs(args);
    originalConsole.error(...maskedArgs);
  };
  
  console.debug = (...args: any[]) => {
    const maskedArgs = processArgs(args);
    originalConsole.debug(...maskedArgs);
  };
};

/**
 * Função segura para logging que sempre mascara emails
 */
export const safeLog = (level: 'log' | 'info' | 'warn' | 'error', message: string, data?: any) => {
  if (isProduction) return; // Não logar em produção
  
  try {
    const maskedMessage = maskEmailsInText(message);
    const maskedData = data ? maskEmailsInText(data) : undefined;
    
    console[level](maskedMessage, maskedData);
  } catch {
    // Falha silenciosamente
  }
};