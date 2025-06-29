
import { ReactNode } from 'react';

interface DataSanitizerProps {
  children: ReactNode;
  data?: any;
  allowedFields?: string[];
  sensitiveFields?: string[];
}

// Utilitário para sanitizar dados antes da exibição
export const sanitizeData = (
  data: any, 
  allowedFields?: string[], 
  sensitiveFields: string[] = ['password', 'token', 'secret', 'key', 'email', 'phone']
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
    
    // Pular campos sensíveis
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
      return;
    }

    // Se há lista de campos permitidos, verificar
    if (allowedFields && !allowedFields.includes(key)) {
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
