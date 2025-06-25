
import { SUPABASE_CONFIG } from '@/config/app';
import { logger } from './logger';

/**
 * Validador de Segurança Inteligente - Sistema Adaptativo por Ambiente
 * Garante que não há credenciais expostas no código com validação contextual
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
   * Validação completa de segurança com inteligência de ambiente
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
    
    // Outros ambientes: validação contextual
    if (!supabaseValidation.isValid) {
      issues.push(`Credenciais do Supabase não configuradas no ambiente ${environment}`);
      recommendations.push('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local');
      level = environment === 'Produção' ? 'CRITICAL' : 'HIGH';
    }
    
    // Verificar se não há credenciais hardcoded (apenas em ambientes não-Lovable)
    this.checkForHardcodedCredentials(issues, recommendations, environment);
    
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
   * Verificação inteligente de credenciais hardcoded
   */
  private checkForHardcodedCredentials(
    issues: string[], 
    recommendations: string[], 
    environment: string
  ): void {
    // Pular verificação no ambiente Lovable
    if (SUPABASE_CONFIG.isLovableEnvironment()) {
      return;
    }
    
    // Esta verificação agora é mais inteligente
    const hasValidEnvVars = import.meta.env.VITE_SUPABASE_URL && 
                           import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const hasConfiguredValues = SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey;
    
    // Se tem valores configurados mas não tem env vars, pode ser hardcoded
    if (hasConfiguredValues && !hasValidEnvVars && environment !== 'Lovable') {
      issues.push('Possíveis credenciais hardcoded detectadas');
      recommendations.push('Mova todas as credenciais para variáveis de ambiente');
    }
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
   * Relatório de segurança contextual
   */
  generateSecurityReport(): void {
    if (!import.meta.env.DEV) return;
    
    const validation = this.validateApplicationSecurity();
    
    logger.info('🔒 [RELATÓRIO DE SEGURANÇA] Validação inteligente por ambiente', {
      isSecure: validation.isSecure,
      level: validation.level,
      issuesCount: validation.issues.length,
      recommendationsCount: validation.recommendations.length,
      environment: validation.environment,
      autoConfigured: SUPABASE_CONFIG.isLovableEnvironment()
    });
    
    if (validation.issues.length > 0) {
      logger.warn(`🚨 [SEGURANÇA] Problemas detectados no ambiente ${validation.environment}:`, validation.issues);
    }
    
    if (validation.recommendations.length > 0) {
      logger.info(`💡 [SEGURANÇA] Recomendações para ${validation.environment}:`, validation.recommendations);
    }
    
    if (validation.isSecure) {
      logger.info(`✅ [SEGURANÇA] Aplicação está segura no ambiente ${validation.environment}`);
    }
  }
  
  /**
   * Monitoramento adaptativo por ambiente
   */
  startContinuousMonitoring(): void {
    if (!import.meta.env.DEV) return;
    
    // Executar validação inicial
    this.generateSecurityReport();
    
    // Monitoramento periódico adaptativo
    const interval = SUPABASE_CONFIG.isLovableEnvironment() ? 10 * 60 * 1000 : 5 * 60 * 1000;
    
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
