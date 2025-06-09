
import { logger } from './logger';

// Sistema centralizado de segurança de ambiente
export class EnvironmentSecurity {
  private static instance: EnvironmentSecurity;
  
  private constructor() {}
  
  static getInstance(): EnvironmentSecurity {
    if (!EnvironmentSecurity.instance) {
      EnvironmentSecurity.instance = new EnvironmentSecurity();
    }
    return EnvironmentSecurity.instance;
  }

  // Verificar se está em produção
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production' || 
           window.location.hostname.includes('viverdeia.ai');
  }

  // Verificar se está em desenvolvimento
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development' && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1');
  }

  // Verificar se pode mostrar recursos de teste
  canShowTestFeatures(): boolean {
    if (this.isProduction()) {
      logger.warn('Tentativa de usar recursos de teste em produção', {
        component: 'ENVIRONMENT_SECURITY',
        hostname: window.location.hostname
      });
      return false;
    }
    
    return this.isDevelopment();
  }

  // Validar ambiente
  validateEnvironment(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verificar HTTPS em produção
    if (this.isProduction() && window.location.protocol !== 'https:') {
      errors.push('HTTPS é obrigatório em produção');
    }

    // Verificar se há credenciais de teste em produção
    if (this.isProduction()) {
      // Estas verificações podem ser expandidas conforme necessário
      const testPatterns = ['teste.com', 'admin@teste.com', 'test', 'debug'];
      testPatterns.forEach(pattern => {
        if (window.location.href.includes(pattern)) {
          warnings.push(`Padrão de teste detectado em produção: ${pattern}`);
        }
      });
    }

    // Verificar cabeçalhos de segurança
    if (this.isProduction() && !document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      warnings.push('CSP não detectado no cabeçalho');
    }

    const isValid = errors.length === 0;
    
    if (!isValid || warnings.length > 0) {
      logger.warn('Problemas de segurança do ambiente detectados', {
        component: 'ENVIRONMENT_SECURITY',
        errors,
        warnings,
        environment: this.isProduction() ? 'production' : 'development'
      });
    }

    return { isValid, errors, warnings };
  }

  // Sanitizar dados para logs em produção
  sanitizeForProduction(data: any): any {
    if (!this.isProduction()) {
      return data; // Em desenvolvimento, mostrar tudo
    }

    // Em produção, sanitizar dados sensíveis
    if (typeof data === 'string') {
      return data.length > 50 ? data.substring(0, 50) + '...' : data;
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret')) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeForProduction(value);
        }
      }
      return sanitized;
    }

    return data;
  }
}

// Instância global
export const environmentSecurity = EnvironmentSecurity.getInstance();

// Função de conveniência
export const canShowTestFeatures = () => environmentSecurity.canShowTestFeatures();
