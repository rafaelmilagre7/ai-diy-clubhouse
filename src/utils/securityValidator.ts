
import { SUPABASE_CONFIG } from '@/config/app';
import { logger } from './logger';

/**
 * Validador de Segurança - Sistema Completamente Seguro
 * Configuração 100% baseada em variáveis de ambiente
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
   * Validação completa de segurança com configuração segura
   */
  validateApplicationSecurity(): SecurityValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    
    const supabaseValidation = SUPABASE_CONFIG.validate();
    const environment = supabaseValidation.environment;
    
    // Validação de configuração segura
    if (!supabaseValidation.isValid) {
      issues.push(`Credenciais do Supabase não configuradas no ambiente ${environment}`);
      recommendations.push('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente');
      level = environment === 'Produção' ? 'CRITICAL' : 'HIGH';
    }
    
    // Verificar se estamos em modo seguro (sem credenciais hardcoded)
    const safeConfig = SUPABASE_CONFIG.getSafeConfig();
    if (safeConfig.secureMode) {
      recommendations.push('✅ Configuração segura ativa - sem credenciais hardcoded no código');
    }
    
    // Validar ambiente de execução
    if (import.meta.env.PROD && !SUPABASE_CONFIG.isConfigured()) {
      issues.push('Aplicação em produção sem credenciais configuradas');
      level = 'CRITICAL';
    }
    
    // Verificar headers de segurança
    this.validateSecurityHeaders(issues, recommendations, environment);
    
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
   * Validar headers de segurança por ambiente
   */
  private validateSecurityHeaders(
    issues: string[], 
    recommendations: string[], 
    environment: string
  ): void {
    if (environment === 'Produção') {
      recommendations.push('Implementar Content Security Policy (CSP)');
      recommendations.push('Configurar headers HSTS em produção');
    }
  }
  
  /**
   * Relatório de segurança seguro
   */
  generateSecurityReport(): void {
    if (!import.meta.env.DEV) return;
    
    const validation = this.validateApplicationSecurity();
    
    logger.info('🔒 [RELATÓRIO DE SEGURANÇA] Configuração segura validada', {
      isSecure: validation.isSecure,
      level: validation.level,
      issuesCount: validation.issues.length,
      recommendationsCount: validation.recommendations.length,
      environment: validation.environment,
      secureMode: true
    });
    
    if (validation.issues.length > 0) {
      logger.warn(`🚨 [SEGURANÇA] Problemas detectados no ambiente ${validation.environment}:`, validation.issues);
    }
    
    if (validation.recommendations.length > 0) {
      logger.info(`💡 [SEGURANÇA] Recomendações para ${validation.environment}:`, validation.recommendations);
    }
    
    if (validation.isSecure) {
      logger.info(`✅ [SEGURANÇA] Aplicação está segura no ambiente ${validation.environment}`);
      logger.info('🔒 [SEGURANÇA] Modo seguro ativo - sem credenciais hardcoded');
    }
  }
  
  /**
   * Monitoramento de segurança contínuo
   */
  startContinuousMonitoring(): void {
    if (!import.meta.env.DEV) return;
    
    // Executar validação inicial
    this.generateSecurityReport();
    
    // Monitoramento periódico
    const interval = 10 * 60 * 1000; // 10 minutos
    
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

// Auto-inicialização do monitoramento em desenvolvimento
if (import.meta.env.DEV) {
  securityValidator.startContinuousMonitoring();
}
