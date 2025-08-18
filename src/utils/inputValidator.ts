
import { z } from 'zod';
import { sanitizeForLogging } from './securityUtils';
import { logger } from './logger';

// Validador robusto de inputs com sanitização automática
export class InputValidator {
  private static instance: InputValidator;
  
  private constructor() {}
  
  static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator();
    }
    return InputValidator.instance;
  }
  
  // Schemas de validação seguros
  private schemas = {
    email: z.string()
      .email('Email inválido')
      .min(5, 'Email muito curto')
      .max(254, 'Email muito longo')
      .refine(this.isSecureEmail.bind(this), 'Email contém caracteres suspeitos'),
    
    password: z.string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .max(128, 'Senha muito longa')
      .refine(this.isSecurePassword.bind(this), 'Senha não atende critérios de segurança'),
    
    name: z.string()
      .min(2, 'Nome muito curto')
      .max(100, 'Nome muito longo')
      .refine(this.isSecureName.bind(this), 'Nome contém caracteres inválidos'),
    
    url: z.string()
      .url('URL inválida')
      .max(2048, 'URL muito longa')
      .refine(this.isSecureUrl.bind(this), 'URL não permitida'),
    
    plainText: z.string()
      .max(5000, 'Texto muito longo')
      .refine(this.isSecureText.bind(this), 'Texto contém conteúdo suspeito')
  };
  
  // Validar email com verificações de segurança
  private isSecureEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    
    // Verificar caracteres perigosos
    const dangerousPatterns = [
      /<script/gi, /javascript:/gi, /on\w+=/gi, /data:/gi
    ];
    
    if (dangerousPatterns.some(pattern => pattern.test(email))) {
      logger.warn("Email com padrões suspeitos detectado", {
        component: 'INPUT_VALIDATOR',
        email: email.substring(0, 5) + '***'
      });
      return false;
    }
    
    // Verificar domínios suspeitos básicos
    const suspiciousDomains = ['tempmail', '10minutemail', 'guerrillamail'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (domain && suspiciousDomains.some(sus => domain.includes(sus))) {
      logger.info("Email de domínio temporário detectado", {
        component: 'INPUT_VALIDATOR',
        domain: domain.substring(0, 5) + '***'
      });
      // Não bloquear, apenas logar
    }
    
    return true;
  }
  
  // Validar senha com critérios de segurança
  private isSecurePassword(password: string): boolean {
    if (!password || typeof password !== 'string') return false;
    
    // Critérios mínimos de segurança
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const criteriaMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;
    
    if (criteriaMet < 3) {
      return false;
    }
    
    // Verificar senhas comuns
    const commonPasswords = [
      '123456', 'password', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', '12345678', 'letmein'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      return false;
    }
    
    return true;
  }
  
  // Validar nome com caracteres seguros
  private isSecureName(name: string): boolean {
    if (!name || typeof name !== 'string') return false;
    
    // Permitir apenas letras, espaços, hífens e apostrofes
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-'\.]+$/;
    return nameRegex.test(name.trim());
  }
  
  // Validar URL com protocolos seguros
  private isSecureUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const parsed = new URL(url);
      
      // Permitir apenas protocolos seguros
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }
      
      // Bloquear IPs locais em produção
      if (import.meta.env.PROD) {
        const hostname = parsed.hostname;
        const localPatterns = [
          /^localhost$/i, /^127\./, /^192\.168\./, /^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./
        ];
        
        if (localPatterns.some(pattern => pattern.test(hostname))) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }
  
  // Validar texto com verificação de XSS
  private isSecureText(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    
    // Verificar padrões XSS básicos
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b/gi,
      /<object\b/gi,
      /<embed\b/gi,
      /data:text\/html/gi
    ];
    
    if (xssPatterns.some(pattern => pattern.test(text))) {
      logger.warn("Texto com padrões XSS detectado", {
        component: 'INPUT_VALIDATOR',
        textLength: text.length
      });
      return false;
    }
    
    return true;
  }
  
  // Sanitizar entrada automaticamente
  sanitizeInput(input: string, type: 'text' | 'html' | 'url' = 'text'): string {
    if (!input || typeof input !== 'string') return '';
    
    let sanitized = input.trim();
    
    switch (type) {
      case 'html':
        // Escape HTML básico
        sanitized = sanitized
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        break;
        
      case 'url':
        try {
          const url = new URL(sanitized);
          sanitized = url.toString();
        } catch {
          sanitized = '';
        }
        break;
        
      case 'text':
      default:
        // Remover caracteres de controle
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
        break;
    }
    
    return sanitized;
  }
  
  // Validar e sanitizar objeto completo
  validateAndSanitize<T>(data: T, schema: z.ZodSchema<T>): { 
    success: boolean; 
    data?: T; 
    errors?: string[];
  } {
    try {
      const result = schema.safeParse(data);
      
      if (result.success) {
        logger.info("Validação de dados bem-sucedida", {
          component: 'INPUT_VALIDATOR',
          dataKeys: Object.keys(data as any).length
        });
        
        return { success: true, data: result.data };
      } else {
        const errors = result.error.errors.map(err => err.message);
        
        logger.warn("Validação de dados falhou", {
          component: 'INPUT_VALIDATOR',
          errors: sanitizeForLogging(errors)
        });
        
        return { success: false, errors };
      }
    } catch (error) {
      logger.error("Erro na validação de dados", {
        component: 'INPUT_VALIDATOR',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      return { success: false, errors: ['Erro interno de validação'] };
    }
  }
  
  // Schemas públicos para uso nos componentes
  getSchemas() {
    return this.schemas;
  }
}

// Instância global
export const inputValidator = InputValidator.getInstance();
