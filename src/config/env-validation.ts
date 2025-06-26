
/**
 * Validação e configuração das variáveis de ambiente
 */

export const ENV_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://zotzvtepvpnkcoobdubt.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ',
  
  // Environment Detection
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Validation
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.SUPABASE_URL) {
      errors.push('VITE_SUPABASE_URL não está configurado');
    }
    
    if (!this.SUPABASE_ANON_KEY) {
      errors.push('VITE_SUPABASE_ANON_KEY não está configurado');
    }
    
    // Verificar se a URL do Supabase está no formato correto
    if (this.SUPABASE_URL && !this.SUPABASE_URL.startsWith('https://')) {
      errors.push('VITE_SUPABASE_URL deve começar com https://');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  // Log da configuração atual (sem expor credenciais)
  logConfiguration(): void {
    console.log('🔧 Configuração do ambiente:', {
      hasSupabaseUrl: !!this.SUPABASE_URL,
      hasSupabaseKey: !!this.SUPABASE_ANON_KEY,
      isDevelopment: this.IS_DEVELOPMENT,
      isProduction: this.IS_PRODUCTION,
      supabaseUrlPrefix: this.SUPABASE_URL ? this.SUPABASE_URL.substring(0, 30) + '...' : 'não configurado'
    });
  }
};

// Validar na inicialização
const validation = ENV_CONFIG.validate();
if (!validation.isValid) {
  console.error('❌ Erros na configuração das variáveis de ambiente:', validation.errors);
} else {
  console.log('✅ Variáveis de ambiente configuradas corretamente');
}

// Log da configuração
ENV_CONFIG.logConfiguration();
