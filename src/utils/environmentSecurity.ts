
import { logger } from './logger';
import { auditLogger } from './auditLogger';

// Validação e controle de ambiente seguro
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
    return import.meta.env.PROD || 
           window.location.hostname.includes('viverdeia.ai');
  }
  
  // Verificar se está em desenvolvimento
  isDevelopment(): boolean {
    return import.meta.env.DEV && 
           (window.location.hostname.includes('localhost') || 
            window.location.hostname.includes('127.0.0.1'));
  }
  
  // Verificar se funcionalidades de teste devem estar habilitadas
  allowTestFeatures(): boolean {
    if (this.isProduction()) {
      logger.warn("Tentativa de usar features de teste em produção", {
        component: 'ENVIRONMENT_SECURITY',
        hostname: window.location.hostname,
        environment: import.meta.env.PROD ? 'production' : 'development'
      });
      
      auditLogger.logSecurityEvent('test_feature_blocked', 'medium', {
        hostname: window.location.hostname,
        environment: import.meta.env.PROD ? 'production' : 'development',
        userAgent: navigator.userAgent.substring(0, 100)
      });
      
      return false;
    }
    
    return this.isDevelopment();
  }
  
  // Verificar se logs debug devem estar habilitados
  allowDebugLogs(): boolean {
    return !this.isProduction();
  }
  
  // Verificar se conexão é segura
  isSecureConnection(): boolean {
    if (this.isProduction()) {
      return window.location.protocol === 'https:';
    }
    
    // Em desenvolvimento, permitir HTTP apenas em localhost
    const hostname = window.location.hostname;
    return window.location.protocol === 'https:' || 
           hostname === 'localhost' || 
           hostname === '127.0.0.1' ||
           hostname.startsWith('localhost:');
  }
  
  // Verificar se domínio é confiável
  isTrustedDomain(): boolean {
    const trustedDomains = [
      'viverdeia.ai',
      'app.viverdeia.ai',
      'localhost',
      '127.0.0.1'
    ];
    
    const hostname = window.location.hostname.toLowerCase();
    return trustedDomains.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  }
  
  // Obter configurações seguras baseadas no ambiente
  getSecureConfig(): {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
    enableTestUsers: boolean;
    enableDebugMode: boolean;
    requireHttps: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  } {
    const isProduction = this.isProduction();
    
    return {
      logLevel: isProduction ? 'warn' : 'debug',
      enableConsole: !isProduction,
      enableTestUsers: !isProduction,
      enableDebugMode: !isProduction,
      requireHttps: isProduction,
      sessionTimeout: isProduction ? 30 * 60 * 1000 : 2 * 60 * 60 * 1000, // 30min prod, 2h dev
      maxLoginAttempts: isProduction ? 3 : 10
    };
  }
  
  // Validar integridade do ambiente
  validateEnvironment(): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Verificar conexão segura
    if (!this.isSecureConnection()) {
      if (this.isProduction()) {
        errors.push('Conexão insegura detectada em produção');
      } else {
        warnings.push('Conexão HTTP em desenvolvimento');
      }
    }
    
    // Verificar domínio
    if (!this.isTrustedDomain()) {
      errors.push('Domínio não confiável detectado');
    }
    
    // Verificar configurações do navegador
    if (!window.crypto || !window.crypto.subtle) {
      warnings.push('Web Crypto API não disponível');
    }
    
    if (!window.localStorage) {
      errors.push('LocalStorage não disponível');
    }
    
    // Verificar headers de segurança (se possível)
    try {
      if (this.isProduction() && !document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
        warnings.push('CSP não detectado');
      }
    } catch {
      // Ignorar erro se não conseguir verificar
    }
    
    // Log dos resultados
    if (errors.length > 0) {
      logger.error("Problemas críticos de segurança detectados", {
        component: 'ENVIRONMENT_SECURITY',
        errors,
        warnings
      });
      
      auditLogger.logSecurityEvent('environment_validation_failed', 'critical', {
        errors,
        warnings,
        hostname: window.location.hostname,
        protocol: window.location.protocol
      });
    } else if (warnings.length > 0) {
      logger.warn("Avisos de segurança detectados", {
        component: 'ENVIRONMENT_SECURITY',
        warnings
      });
    } else {
      logger.info("Validação de ambiente concluída com sucesso", {
        component: 'ENVIRONMENT_SECURITY'
      });
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }
  
  // Aplicar configurações de segurança baseadas no ambiente
  applySecurityConfig(): void {
    const config = this.getSecureConfig();
    
    // Configurar logger
    if (typeof window !== 'undefined' && (window as any).logger) {
      (window as any).logger.setLogLevel(config.logLevel);
      (window as any).logger.setConsoleEnabled(config.enableConsole);
    }
    
    // Aplicar timeout de sessão
    if (config.requireHttps && !this.isSecureConnection()) {
      logger.error("HTTPS obrigatório em produção", {
        component: 'ENVIRONMENT_SECURITY'
      });
    }
    
    logger.info("Configurações de segurança aplicadas", {
      component: 'ENVIRONMENT_SECURITY',
      environment: this.isProduction() ? 'production' : 'development',
      config: {
        logLevel: config.logLevel,
        enableTestUsers: config.enableTestUsers,
        requireHttps: config.requireHttps
      }
    });
  }
}

// Instância global
export const environmentSecurity = EnvironmentSecurity.getInstance();

// Função utilitária para verificar se pode mostrar features de teste
export const canShowTestFeatures = (): boolean => {
  return environmentSecurity.allowTestFeatures();
};

// Função utilitária para verificar se pode fazer debug
export const canDebug = (): boolean => {
  return environmentSecurity.allowDebugLogs();
};

// Inicialização automática
if (typeof window !== 'undefined') {
  environmentSecurity.validateEnvironment();
  environmentSecurity.applySecurityConfig();
}
