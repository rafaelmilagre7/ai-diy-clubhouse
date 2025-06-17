
interface SecurityCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

class OptimizedSecurityValidator {
  private static instance: OptimizedSecurityValidator;
  private cache: Map<string, SecurityCheck> = new Map();
  private lastRun: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  static getInstance(): OptimizedSecurityValidator {
    if (!OptimizedSecurityValidator.instance) {
      OptimizedSecurityValidator.instance = new OptimizedSecurityValidator();
    }
    return OptimizedSecurityValidator.instance;
  }

  // OTIMIZAÇÃO: Validações essenciais apenas
  validateBasicSecurity(): SecurityCheck[] {
    const now = Date.now();
    
    // OTIMIZAÇÃO: Usar cache se disponível
    if (now - this.lastRun < this.CACHE_DURATION && this.cache.size > 0) {
      return Array.from(this.cache.values());
    }

    const checks: SecurityCheck[] = [];

    // OTIMIZAÇÃO: Apenas verificações críticas e rápidas
    try {
      // 1. HTTPS em produção
      if (import.meta.env.PROD && window.location.protocol !== 'https:') {
        checks.push({
          name: 'https_check',
          status: 'warn',
          message: 'HTTPS recomendado em produção'
        });
      } else {
        checks.push({
          name: 'https_check',
          status: 'pass',
          message: 'Protocolo de segurança OK'
        });
      }

      // 2. Ambiente de desenvolvimento
      if (import.meta.env.DEV) {
        checks.push({
          name: 'dev_environment',
          status: 'pass',
          message: 'Ambiente de desenvolvimento detectado'
        });
      }

      // 3. Supabase URL presente (check rápido)
      const hasSupabaseUrl = window.location.hostname.includes('supabase') || 
                            import.meta.env.VITE_SUPABASE_URL;
      checks.push({
        name: 'supabase_config',
        status: hasSupabaseUrl ? 'pass' : 'warn',
        message: hasSupabaseUrl ? 'Configuração Supabase OK' : 'Verificar configuração Supabase'
      });

    } catch (error) {
      checks.push({
        name: 'security_validation',
        status: 'warn',
        message: 'Erro na validação de segurança'
      });
    }

    // OTIMIZAÇÃO: Atualizar cache
    this.cache.clear();
    checks.forEach(check => this.cache.set(check.name, check));
    this.lastRun = now;

    return checks;
  }

  // OTIMIZAÇÃO: Relatório simplificado apenas em DEV
  generateSecurityReport(): void {
    if (!import.meta.env.DEV) {
      return; // OTIMIZAÇÃO: Não executar em produção
    }

    const checks = this.validateBasicSecurity();
    const warnings = checks.filter(c => c.status === 'warn');
    const failures = checks.filter(c => c.status === 'fail');

    if (warnings.length > 0 || failures.length > 0) {
      console.group('🔒 Relatório de Segurança Otimizado');
      
      if (failures.length > 0) {
        console.error('❌ Falhas de segurança:', failures);
      }
      
      if (warnings.length > 0) {
        console.warn('⚠️ Avisos de segurança:', warnings);
      }
      
      console.groupEnd();
    } else {
      console.log('✅ Validação de segurança: OK');
    }
  }

  // OTIMIZAÇÃO: Limpeza de cache
  clearCache(): void {
    this.cache.clear();
    this.lastRun = 0;
  }
}

export const optimizedSecurityValidator = OptimizedSecurityValidator.getInstance();
