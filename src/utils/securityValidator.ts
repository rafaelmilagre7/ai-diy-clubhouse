
import { SUPABASE_CONFIG } from '@/config/app';
import { logger } from './logger';

/**
 * Validador de Segurança Otimizado - Configuração mais leve para desenvolvimento
 */

interface SecurityValidationResult {
  isSecure: boolean;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  issues: string[];
  recommendations: string[];
  environment: string;
}

export class SecurityValidator {
  private static instance: SecurityValidator;
  
  private constructor() {}
  
  static getInstance(): SecurityValidator {
    if (!SecurityValidator.instance) {
      SecurityValidator.instance = new SecurityValidator();
    }
    return SecurityValidator.instance;
  }
  
  /**
   * Validação otimizada com menos overhead em desenvolvimento
   */
  validateApplicationSecurity(): SecurityValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    
    const supabaseValidation = SUPABASE_CONFIG.validate();
    const environment = supabaseValidation.environment;
    
    // Ambiente Lovable: sempre seguro (configuração automática)
    if (SUPABASE_CONFIG.isLovableEnvironment()) {
      return {
        isSecure: true,
        level: 'LOW',
        issues: [],
        recommendations: ['Executando no ambiente Lovable - configuração automática ativa'],
        environment
      };
    }
    
    // Em desenvolvimento, validação mais relaxada
    if (import.meta.env.DEV) {
      return {
        isSecure: true,
        level: 'LOW',
        issues: [],
        recommendations: ['Ambiente de desenvolvimento - validações relaxadas'],
        environment: 'Desenvolvimento'
      };
    }
    
    // Outros ambientes: validação contextual
    if (!supabaseValidation.isValid) {
      issues.push(`Credenciais do Supabase não configuradas no ambiente ${environment}`);
      recommendations.push('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local');
      level = environment === 'Produção' ? 'CRITICAL' : 'HIGH';
    }
    
    const isSecure = issues.length === 0;
    
    return {
      isSecure,
      level: isSecure ? 'LOW' : level,
      issues,
      recommendations,
      environment
    };
  }
  
  /**
   * Relatório otimizado que não bloqueia inicialização
   */
  generateSecurityReport(): void {
    // Executar de forma assíncrona em desenvolvimento
    if (import.meta.env.DEV) {
      setTimeout(() => {
        const validation = this.validateApplicationSecurity();
        
        logger.info('🔒 [SEGURANÇA] Validação otimizada', {
          isSecure: validation.isSecure,
          level: validation.level,
          environment: validation.environment,
          developmentMode: true
        });
        
        if (validation.issues.length > 0) {
          logger.warn(`🚨 [SEGURANÇA] Problemas detectados:`, validation.issues);
        }
      }, 100); // Delay mínimo para não bloquear
      return;
    }
    
    // Execução síncrona apenas em produção
    const validation = this.validateApplicationSecurity();
    
    if (validation.issues.length > 0) {
      logger.warn(`🚨 [SEGURANÇA] Problemas detectados no ambiente ${validation.environment}:`, validation.issues);
    }
    
    if (validation.isSecure) {
      logger.info(`✅ [SEGURANÇA] Aplicação está segura no ambiente ${validation.environment}`);
    }
  }
  
  /**
   * Monitoramento otimizado para desenvolvimento
   */
  startContinuousMonitoring(): void {
    if (!import.meta.env.DEV) return;
    
    // Executar validação inicial de forma não-bloqueante
    setTimeout(() => {
      this.generateSecurityReport();
    }, 1000);
    
    // Monitoramento muito mais espaçado em desenvolvimento
    const interval = 15 * 60 * 1000; // 15 minutos
    
    setInterval(() => {
      const validation = this.validateApplicationSecurity();
      if (!validation.isSecure && validation.level === 'CRITICAL') {
        logger.warn(`🔒 [MONITOR] Problemas críticos de segurança no ambiente ${validation.environment}`);
      }
    }, interval);
  }
}

// Instância singleton para uso global
export const securityValidator = SecurityValidator.getInstance();

// Auto-inicialização otimizada
if (import.meta.env.DEV) {
  // Executar de forma não-bloqueante em desenvolvimento
  setTimeout(() => {
    securityValidator.startContinuousMonitoring();
  }, 5000); // 5 segundos de delay
}
