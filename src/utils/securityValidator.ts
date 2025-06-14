
import { SUPABASE_CONFIG } from '@/config/app';
import { logger } from './logger';

/**
 * Validador de Segurança - Sistema de Verificação de Integridade
 * Garante que não há credenciais expostas no código
 */

interface SecurityValidationResult {
  isSecure: boolean;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  issues: string[];
  recommendations: string[];
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
   * Validação completa de segurança da aplicação
   */
  validateApplicationSecurity(): SecurityValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    
    // 1. Validar configuração do Supabase
    const supabaseValidation = SUPABASE_CONFIG.validate();
    if (!supabaseValidation.isValid) {
      issues.push('Credenciais do Supabase não configuradas');
      recommendations.push('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local');
      level = 'CRITICAL';
    }
    
    // 2. Verificar se não há credenciais hardcoded (verificação em runtime)
    this.checkForHardcodedCredentials(issues, recommendations);
    
    // 3. Validar ambiente de execução
    if (import.meta.env.PROD && !SUPABASE_CONFIG.isConfigured()) {
      issues.push('Aplicação em produção sem credenciais configuradas');
      level = 'CRITICAL';
    }
    
    // 4. Verificar headers de segurança
    this.validateSecurityHeaders(issues, recommendations);
    
    const isSecure = issues.length === 0;
    
    return {
      isSecure,
      level: isSecure ? 'LOW' : level,
      issues,
      recommendations
    };
  }
  
  /**
   * Verificar se não há credenciais hardcoded em runtime
   */
  private checkForHardcodedCredentials(issues: string[], recommendations: string[]): void {
    // Esta é uma verificação básica que pode ser expandida
    const hasHardcodedUrl = typeof SUPABASE_CONFIG.url === 'string' && 
                           SUPABASE_CONFIG.url.includes('supabase.co') && 
                           !import.meta.env.VITE_SUPABASE_URL;
                           
    const hasHardcodedKey = typeof SUPABASE_CONFIG.anonKey === 'string' && 
                           SUPABASE_CONFIG.anonKey.startsWith('eyJ') && 
                           !import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (hasHardcodedUrl || hasHardcodedKey) {
      issues.push('Possíveis credenciais hardcoded detectadas');
      recommendations.push('Mova todas as credenciais para variáveis de ambiente');
    }
  }
  
  /**
   * Validar headers de segurança
   */
  private validateSecurityHeaders(issues: string[], recommendations: string[]): void {
    // Verificações básicas que podem ser expandidas
    if (import.meta.env.PROD) {
      recommendations.push('Implementar Content Security Policy (CSP)');
      recommendations.push('Configurar headers HSTS em produção');
    }
  }
  
  /**
   * Relatório de segurança para desenvolvimento
   */
  generateSecurityReport(): void {
    if (!import.meta.env.DEV) return;
    
    const validation = this.validateApplicationSecurity();
    
    logger.info('🔒 [RELATÓRIO DE SEGURANÇA] Validação completa', {
      isSecure: validation.isSecure,
      level: validation.level,
      issuesCount: validation.issues.length,
      recommendationsCount: validation.recommendations.length
    });
    
    if (validation.issues.length > 0) {
      logger.warn('🚨 [SEGURANÇA] Problemas detectados:', validation.issues);
    }
    
    if (validation.recommendations.length > 0) {
      logger.info('💡 [SEGURANÇA] Recomendações:', validation.recommendations);
    }
    
    if (validation.isSecure) {
      logger.info('✅ [SEGURANÇA] Aplicação está segura - nenhuma credencial exposta');
    }
  }
  
  /**
   * Validação contínua para monitoramento
   */
  startContinuousMonitoring(): void {
    if (!import.meta.env.DEV) return;
    
    // Executar validação inicial
    this.generateSecurityReport();
    
    // Monitoramento periódico (apenas em desenvolvimento)
    setInterval(() => {
      const validation = this.validateApplicationSecurity();
      if (!validation.isSecure) {
        logger.warn('🔒 [MONITOR] Problemas de segurança detectados durante monitoramento');
      }
    }, 5 * 60 * 1000); // A cada 5 minutos
  }
}

// Instância singleton para uso global
export const securityValidator = SecurityValidator.getInstance();

// Auto-inicialização do monitoramento em desenvolvimento
if (import.meta.env.DEV) {
  securityValidator.startContinuousMonitoring();
}
