import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeHtml } from './validation';

// Enhanced server-side validation with security checks
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

// SQL injection protection patterns
const SQL_INJECTION_PATTERNS = [
  /('|(\\x27)|(\\x2D\\x2D)|(\;)|(\||\\x7C))/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\\x27)|(\')|(\\x22)|(\"))/i,
  /(\%27)|(\')|(\\x27)|(\;)|(\||\\x7C)/i,
  /((\%3C)|<)[^\n]+((\%3E)|>)/i,
  /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i,
  /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))[^\n]+((\%3E)|>)/i,
  /((\%3C)|<)((\%73)|s|(\%53))((\%63)|c|(\%43))((\%72)|r|(\%52))((\%69)|i|(\%49))((\%70)|p|(\%50))((\%74)|t|(\%54))/i,
];

// XSS protection patterns
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /onmouseover\s*=/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>/gi,
];

// Validate and sanitize text input
export const validateTextInput = (input: string, maxLength: number = 1000): ValidationResult => {
  const errors: string[] = [];
  
  // Check for SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      errors.push('Entrada contém caracteres suspeitos de injeção SQL');
      break;
    }
  }
  
  // Check for XSS patterns
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) {
      errors.push('Entrada contém código potencialmente malicioso');
      break;
    }
  }
  
  // Length validation
  if (input.length > maxLength) {
    errors.push(`Texto muito longo. Máximo: ${maxLength} caracteres`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: sanitizeHtml(input)
  };
};

// Enhanced file validation with MIME type verification
export const validateFileSecure = async (file: File, allowedTypes: string[], maxSizeMB: number): Promise<ValidationResult> => {
  const errors: string[] = [];
  
  // Basic file validation
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}`);
  }
  
  // Size validation
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
  }
  
  // Filename validation
  if (file.name.length > 255) {
    errors.push('Nome do arquivo muito longo');
  }
  
  // Check for dangerous characters
  if (/[<>:"/\\|?*]/.test(file.name)) {
    errors.push('Nome do arquivo contém caracteres inválidos');
  }
  
  // MIME type verification using file signature
  try {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer.slice(0, 4));
    const signature = Array.from(uint8Array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('').toUpperCase();
    
    // Common file signatures
    const signatures: Record<string, string[]> = {
      'image/jpeg': ['FFD8FFE0', 'FFD8FFE1', 'FFD8FFDB'],
      'image/png': ['89504E47'],
      'image/gif': ['47494638'],
      'application/pdf': ['25504446'],
      'image/webp': ['52494646'],
    };
    
    if (file.type in signatures) {
      const validSignatures = signatures[file.type];
      const isValidSignature = validSignatures.some(sig => signature.startsWith(sig));
      
      if (!isValidSignature) {
        errors.push('Arquivo não corresponde ao tipo declarado');
      }
    }
  } catch (error) {
    console.warn('Não foi possível verificar assinatura do arquivo:', error);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Enhanced form validation with rate limiting
export const validateFormSubmission = async (
  formData: any,
  schema: z.ZodSchema,
  actionType: string,
  rateLimitConfig?: { maxAttempts?: number; windowMinutes?: number }
): Promise<ValidationResult> => {
  const errors: string[] = [];
  
  try {
    // Rate limiting check
    const { data: rateLimitAllowed } = await supabase.rpc('check_rate_limit', {
      p_identifier: getClientIdentifier(),
      p_action_type: actionType,
      p_max_attempts: rateLimitConfig?.maxAttempts || 10,
      p_window_minutes: rateLimitConfig?.windowMinutes || 5
    });
    
    if (!rateLimitAllowed) {
      errors.push('Muitas tentativas. Tente novamente em alguns minutos.');
      return { isValid: false, errors };
    }
    
    // Schema validation
    const result = schema.safeParse(formData);
    if (!result.success) {
      errors.push(...result.error.errors.map(err => err.message));
    }
    
    // Additional text input validation for all string fields
    const sanitizedData: any = {};
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        const textValidation = validateTextInput(value, 5000);
        if (!textValidation.isValid) {
          errors.push(...textValidation.errors.map(err => `${key}: ${err}`));
        } else {
          sanitizedData[key] = textValidation.sanitizedData;
        }
      } else {
        sanitizedData[key] = value;
      }
    }
    
    return {
      isValid: errors.length === 0 && result.success,
      errors,
      sanitizedData: result.success ? sanitizedData : undefined
    };
    
  } catch (error) {
    console.error('Form validation error:', error);
    return {
      isValid: false,
      errors: ['Erro interno na validação do formulário']
    };
  }
};

// Generate client identifier for rate limiting
function getClientIdentifier(): string {
  // Use a combination of factors to create a stable identifier
  const factors = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset().toString()
  ];
  
  return btoa(factors.join('|')).slice(0, 32);
}

// Database input sanitization
export const sanitizeForDatabase = (input: any): any => {
  if (typeof input === 'string') {
    return input
      .replace(/\0/g, '') // Remove null bytes
      .replace(/\\/g, '\\\\') // Escape backslashes
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeForDatabase);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeForDatabase(value);
    }
    return sanitized;
  }
  
  return input;
};