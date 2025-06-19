
import { securityMonitor } from './securityMonitor';
import { logger } from './logger';

interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  violations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ValidationRule {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: 'block' | 'sanitize' | 'warn';
}

interface CSPDirective {
  directive: string;
  values: string[];
}

class AdvancedInputValidation {
  private static instance: AdvancedInputValidation;
  private validationRules: ValidationRule[] = [];
  private cspDirectives: CSPDirective[] = [];

  private constructor() {
    this.initializeValidationRules();
    this.initializeCSPDirectives();
  }

  static getInstance(): AdvancedInputValidation {
    if (!AdvancedInputValidation.instance) {
      AdvancedInputValidation.instance = new AdvancedInputValidation();
    }
    return AdvancedInputValidation.instance;
  }

  // Inicializar regras de validação
  private initializeValidationRules(): void {
    this.validationRules = [
      {
        id: 'script_injection',
        name: 'Script Injection',
        pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        severity: 'critical',
        description: 'Tentativa de injeção de script malicioso',
        action: 'block'
      },
      {
        id: 'iframe_injection',
        name: 'Iframe Injection',
        pattern: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        severity: 'high',
        description: 'Tentativa de injeção de iframe',
        action: 'block'
      },
      {
        id: 'event_handler_injection',
        name: 'Event Handler Injection',
        pattern: /on\w+\s*=\s*['"][^'"]*['"]/gi,
        severity: 'high',
        description: 'Tentativa de injeção de manipulador de eventos',
        action: 'sanitize'
      },
      {
        id: 'javascript_protocol',
        name: 'JavaScript Protocol',
        pattern: /javascript\s*:/gi,
        severity: 'high',
        description: 'Uso de protocolo javascript',
        action: 'block'
      },
      {
        id: 'data_url_html',
        name: 'Data URL HTML',
        pattern: /data\s*:\s*text\/html/gi,
        severity: 'high',
        description: 'URL de dados HTML suspeita',
        action: 'block'
      },
      {
        id: 'sql_injection_basic',
        name: 'SQL Injection Básico',
        pattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)|('|(\\x[0-9a-f]{2})+)/gi,
        severity: 'critical',
        description: 'Tentativa de injeção SQL',
        action: 'block'
      },
      {
        id: 'path_traversal',
        name: 'Path Traversal',
        pattern: /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/gi,
        severity: 'high',
        description: 'Tentativa de traversal de diretório',
        action: 'block'
      },
      {
        id: 'command_injection',
        name: 'Command Injection',
        pattern: /(\||;|&|`|\$\(|\$\{)/g,
        severity: 'critical',
        description: 'Tentativa de injeção de comando',
        action: 'warn'
      },
      {
        id: 'xml_external_entity',
        name: 'XML External Entity',
        pattern: /<!ENTITY\s+\w+\s+SYSTEM\s*["'][^"']*["']\s*>/gi,
        severity: 'high',
        description: 'Tentativa de ataque XXE',
        action: 'block'
      },
      {
        id: 'css_injection',
        name: 'CSS Injection',
        pattern: /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
        severity: 'medium',
        description: 'Tentativa de injeção CSS',
        action: 'sanitize'
      }
    ];

    logger.info('Regras de validação inicializadas', {
      component: 'ADVANCED_INPUT_VALIDATION',
      rulesCount: this.validationRules.length
    });
  }

  // Inicializar diretivas CSP
  private initializeCSPDirectives(): void {
    this.cspDirectives = [
      {
        directive: 'default-src',
        values: ["'self'"]
      },
      {
        directive: 'script-src',
        values: [
          "'self'",
          "'unsafe-inline'", // Necessário para alguns frameworks
          "'unsafe-eval'", // Necessário para desenvolvimento
          'https://cdn.jsdelivr.net',
          'https://unpkg.com'
        ]
      },
      {
        directive: 'style-src',
        values: [
          "'self'",
          "'unsafe-inline'", // Necessário para CSS-in-JS
          'https://fonts.googleapis.com'
        ]
      },
      {
        directive: 'img-src',
        values: [
          "'self'",
          'data:',
          'blob:',
          'https:',
          process.env.VITE_SUPABASE_URL ? new URL(process.env.VITE_SUPABASE_URL).origin : ''
        ].filter(Boolean)
      },
      {
        directive: 'font-src',
        values: [
          "'self'",
          'https://fonts.gstatic.com'
        ]
      },
      {
        directive: 'connect-src',
        values: [
          "'self'",
          process.env.VITE_SUPABASE_URL || '',
          'wss:',
          'ws:'
        ].filter(Boolean)
      },
      {
        directive: 'frame-ancestors',
        values: ["'none'"]
      },
      {
        directive: 'base-uri',
        values: ["'self'"]
      },
      {
        directive: 'form-action',
        values: ["'self'"]
      }
    ];
  }

  // Validar entrada
  validateInput(
    input: string, 
    context: string = 'general', 
    userId?: string
  ): ValidationResult {
    if (!input || typeof input !== 'string') {
      return {
        isValid: true,
        sanitizedValue: input || '',
        violations: [],
        severity: 'low'
      };
    }

    const violations: string[] = [];
    let sanitizedValue = input;
    let maxSeverity: ValidationResult['severity'] = 'low';

    // Aplicar regras de validação
    this.validationRules.forEach(rule => {
      if (rule.pattern.test(input)) {
        violations.push(rule.description);
        
        // Atualizar severidade máxima
        if (this.getSeverityLevel(rule.severity) > this.getSeverityLevel(maxSeverity)) {
          maxSeverity = rule.severity;
        }

        // Aplicar ação
        switch (rule.action) {
          case 'block':
            // Input será rejeitado
            break;
          case 'sanitize':
            sanitizedValue = sanitizedValue.replace(rule.pattern, '');
            break;
          case 'warn':
            // Apenas log, não bloquear
            break;
        }

        // Monitorar violação
        securityMonitor.monitorInput(input, context, userId);

        logger.warn('Violação de validação detectada', {
          component: 'ADVANCED_INPUT_VALIDATION',
          rule: rule.name,
          severity: rule.severity,
          context,
          userId: userId?.substring(0, 8) + '***',
          action: rule.action,
          inputSample: input.substring(0, 50) + (input.length > 50 ? '...' : '')
        });
      }
    });

    // Aplicar sanitização adicional
    sanitizedValue = this.applySanitization(sanitizedValue);

    const isValid = violations.length === 0 || !violations.some(v => 
      this.validationRules.find(r => r.description === v)?.action === 'block'
    );

    return {
      isValid,
      sanitizedValue,
      violations,
      severity: maxSeverity
    };
  }

  // Aplicar sanitização adicional
  private applySanitization(input: string): string {
    return input
      // Remover caracteres de controle
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Escapar caracteres HTML básicos
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      // Remover caracteres unicode perigosos
      .replace(/[\u2028\u2029]/g, '')
      // Limitar comprimento
      .substring(0, 10000);
  }

  // Obter nível numérico da severidade
  private getSeverityLevel(severity: ValidationResult['severity']): number {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[severity];
  }

  // Validar email de forma segura
  validateEmail(email: string): ValidationResult {
    const emailResult = this.validateInput(email, 'email');
    
    if (!emailResult.isValid) {
      return emailResult;
    }

    // Validação específica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(emailResult.sanitizedValue);
    
    if (!isValidFormat) {
      return {
        isValid: false,
        sanitizedValue: emailResult.sanitizedValue,
        violations: [...emailResult.violations, 'Formato de email inválido'],
        severity: 'medium'
      };
    }

    // Verificar domínios suspeitos
    const suspiciousDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com'
    ];

    const domain = emailResult.sanitizedValue.split('@')[1]?.toLowerCase();
    if (domain && suspiciousDomains.includes(domain)) {
      return {
        isValid: false,
        sanitizedValue: emailResult.sanitizedValue,
        violations: [...emailResult.violations, 'Domínio de email temporário não permitido'],
        severity: 'medium'
      };
    }

    return {
      ...emailResult,
      isValid: true
    };
  }

  // Validar senha
  validatePassword(password: string): ValidationResult {
    const passwordResult = this.validateInput(password, 'password');
    
    if (!passwordResult.isValid) {
      return passwordResult;
    }

    const violations: string[] = [...passwordResult.violations];

    // Critérios de força da senha
    if (password.length < 8) {
      violations.push('Senha deve ter pelo menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      violations.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
      violations.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
      violations.push('Senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
      violations.push('Senha deve conter pelo menos um caractere especial');
    }

    // Verificar senhas comuns
    const commonPasswords = [
      '123456', 'password', '123456789', '12345678', '12345',
      '1234567', '1234567890', 'qwerty', 'abc123', 'password1'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      violations.push('Senha muito comum, escolha uma senha mais segura');
    }

    return {
      isValid: violations.length === 0,
      sanitizedValue: password, // Não sanitizar senhas
      violations,
      severity: violations.length > 0 ? 'medium' : 'low'
    };
  }

  // Gerar CSP dinâmico
  generateCSP(): string {
    return this.cspDirectives
      .map(directive => `${directive.directive} ${directive.values.join(' ')}`)
      .join('; ');
  }

  // Aplicar CSP ao documento
  applyCSP(): void {
    if (typeof document === 'undefined') return;

    const csp = this.generateCSP();
    
    // Remover CSP existente
    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingMeta) {
      existingMeta.remove();
    }

    // Adicionar novo CSP
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);

    logger.info('CSP aplicado dinamicamente', {
      component: 'ADVANCED_INPUT_VALIDATION',
      csp: csp.substring(0, 200) + '...'
    });
  }

  // Adicionar domínio às diretivas CSP
  addCSPDomain(directive: string, domain: string): void {
    const cspDirective = this.cspDirectives.find(d => d.directive === directive);
    if (cspDirective && !cspDirective.values.includes(domain)) {
      cspDirective.values.push(domain);
      this.applyCSP(); // Reaplicar CSP
    }
  }

  // Obter estatísticas de validação
  getValidationStats(): {
    totalRules: number;
    rulesBySeverity: Record<string, number>;
    rulesStatus: { id: string; name: string; severity: string }[];
  } {
    const rulesBySeverity = this.validationRules.reduce((acc, rule) => {
      acc[rule.severity] = (acc[rule.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const rulesStatus = this.validationRules.map(rule => ({
      id: rule.id,
      name: rule.name,
      severity: rule.severity
    }));

    return {
      totalRules: this.validationRules.length,
      rulesBySeverity,
      rulesStatus
    };
  }
}

export const advancedInputValidation = AdvancedInputValidation.getInstance();

// Aplicar CSP automaticamente
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    advancedInputValidation.applyCSP();
  });
}
