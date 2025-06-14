import { ReactNode } from 'react';

// --- Funções de Máscara ---
const maskEmail = (email: string): string => {
  if (typeof email !== 'string' || email.indexOf('@') === -1) return '[INVALID_EMAIL]';
  const [user, domain] = email.split('@');
  if (!user || !domain) return '[INVALID_EMAIL]';
  return `${user.substring(0, 1)}***@${domain}`;
};

const maskId = (id: string): string => {
  if (typeof id !== 'string' || id.length < 8) return `[REDACTED]`;
  return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
};

// Utilitário para sanitizar dados antes da exibição ou log
export const sanitizeData = (
  data: any,
  allowedFields?: string[],
  sensitiveFields: string[] = ['password', 'token', 'secret', 'key', 'apiKey', 'accessToken', 'refreshToken', 'session']
): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item, allowedFields, sensitiveFields));
  }

  const sanitized: any = {};

  Object.keys(data).forEach(key => {
    const value = data[key];
    const lowerKey = key.toLowerCase();

    // Se há lista de campos permitidos, pular os que não estão nela
    if (allowedFields && !allowedFields.includes(key)) {
      return;
    }

    // Pular campos sensíveis genéricos
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = `[REDACTED_${key.toUpperCase()}]`;
      return;
    }
    
    // Aplicar máscaras específicas
    if (lowerKey.includes('email')) {
        sanitized[key] = typeof value === 'string' ? maskEmail(value) : '[REDACTED]';
        return;
    }
    if (lowerKey.includes('id') || lowerKey.includes('userid') || lowerKey.includes('user_id')) {
        sanitized[key] = typeof value === 'string' ? maskId(value) : '[REDACTED]';
        return;
    }

    // Recursivamente sanitizar objetos aninhados
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value, allowedFields, sensitiveFields);
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

// Adicionando a definição de props que estava faltando.
interface DataSanitizerProps {
  children?: React.ReactNode | ((sanitizedData: any) => React.ReactNode);
  data?: any;
  allowedFields?: string[];
  sensitiveFields?: string[];
}

// Componente para exibir dados sanitizados
export const DataSanitizer: React.FC<DataSanitizerProps> = ({ 
  children, 
  data, 
  allowedFields,
  sensitiveFields 
}) => {
  // Se há dados para sanitizar, sanitizá-los antes de renderizar
  if (data) {
    const sanitizedData = sanitizeData(data, allowedFields, sensitiveFields);
    
    // Injetar dados sanitizados nos children se necessário
    if (typeof children === 'function') {
      return (children as any)(sanitizedData);
    }
  }

  return <>{children}</>;
};

// Hook para sanitização de dados
export const useSanitizedData = <T extends any>(
  data: T, 
  allowedFields?: string[], 
  sensitiveFields?: string[]
): T => {
  if (!data) return data;
  
  return sanitizeData(data, allowedFields, sensitiveFields) as T;
};
