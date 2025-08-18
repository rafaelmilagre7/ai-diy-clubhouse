import { logger } from '@/utils/logger';
import { maskEmail, maskEmailsInText } from '@/utils/emailMasking';

interface SecurityLogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  userId?: string;
  data?: any;
}

// Lista de campos sensíveis que devem ser mascarados
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'email',
  'phone',
  'cpf',
  'cnpj',
  'raw_user_meta_data'
];

/**
 * Máscara dados sensíveis para logs de produção
 */
const maskSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return maskEmailsInText(data);
  }

  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }

  const masked: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field));
    
    if (isSensitive) {
      if (lowerKey.includes('email') && typeof value === 'string') {
        masked[key] = maskEmail(value);
      } else if (typeof value === 'string' && value.length > 0) {
        masked[key] = value.substring(0, 3) + '***';
      } else {
        masked[key] = '***';
      }
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = maskEmailsInText(value);
    }
  }
  
  return masked;
};

/**
 * Máscara IDs de usuário para logs seguros
 */
const maskUserId = (userId?: string): string => {
  if (!userId || userId.length < 8) return '***';
  return userId.substring(0, 8) + '***';
};

/**
 * Logger seguro para produção que mascara dados sensíveis
 */
export const secureLogger = {
  debug: (entry: SecurityLogEntry) => {
    if (import.meta.env.PROD) {
      // Em produção, não loggar debug
      return;
    }
    
    logger.debug(entry.message, {
      userId: entry.userId ? maskUserId(entry.userId) : undefined,
      data: entry.data ? maskSensitiveData(entry.data) : undefined
    });
  },

  info: (entry: SecurityLogEntry) => {
    logger.info(entry.message, {
      userId: entry.userId ? maskUserId(entry.userId) : undefined,
      data: entry.data ? maskSensitiveData(entry.data) : undefined
    });
  },

  warn: (entry: SecurityLogEntry) => {
    logger.warn(entry.message, {
      userId: entry.userId ? maskUserId(entry.userId) : undefined,
      data: entry.data ? maskSensitiveData(entry.data) : undefined
    });
  },

  error: (entry: SecurityLogEntry) => {
    logger.error(entry.message, {
      userId: entry.userId ? maskUserId(entry.userId) : undefined,
      data: entry.data ? maskSensitiveData(entry.data) : undefined
    });
  },

  // Log de segurança específico para eventos críticos
  security: (action: string, userId?: string, details?: any) => {
    const entry = {
      level: 'warn' as const,
      message: `[SECURITY] ${action}`,
      userId,
      data: details
    };
    
    secureLogger.warn(entry);
  }
};

/**
 * Wrapper para logs de autenticação que automaticamente mascarar dados
 */
export const authLogger = {
  loginAttempt: (email: string, success: boolean, error?: string) => {
    secureLogger.info({
      level: 'info',
      message: `Login attempt: ${success ? 'SUCCESS' : 'FAILED'}`,
      data: {
        email: maskEmail(email),
        success,
        error: error ? error.substring(0, 50) + '***' : undefined
      }
    });
  },

  roleChange: (targetUserId: string, newRole: string, adminId: string) => {
    secureLogger.security('Role change attempted', adminId, {
      targetUser: maskUserId(targetUserId),
      newRole,
      timestamp: new Date().toISOString()
    });
  },

  privilegeEscalation: (userId: string, attemptedAction: string) => {
    secureLogger.security('Privilege escalation attempt', userId, {
      action: attemptedAction,
      timestamp: new Date().toISOString()
    });
  }
};