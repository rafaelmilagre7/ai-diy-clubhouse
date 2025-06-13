
// Configuração centralizada da aplicação
export const APP_CONFIG = {
  // Domínio principal da aplicação
  DOMAIN: import.meta.env.VITE_APP_DOMAIN || 'https://app.viverdeia.ai',
  
  // Domínio de desenvolvimento para fallback
  DEV_DOMAIN: 'http://localhost:3000',
  
  // Verificar se estamos em desenvolvimento
  isDevelopment: import.meta.env.DEV,
  
  // Obter o domínio correto baseado no ambiente
  getAppDomain(): string {
    // Se estivermos em localhost, usar localhost
    if (window.location.hostname === 'localhost') {
      return this.DEV_DOMAIN;
    }
    
    // Caso contrário, sempre usar o domínio personalizado
    return this.DOMAIN;
  },
  
  // Gerar URL completa para uma rota
  getAppUrl(path: string = ''): string {
    const domain = this.getAppDomain();
    return `${domain}${path.startsWith('/') ? path : `/${path}`}`;
  }
};

// Configuração do Supabase com variáveis de ambiente
export const SUPABASE_CONFIG = {
  // URL do projeto Supabase
  url: import.meta.env.VITE_SUPABASE_URL || 'https://zotzvtepvpnkcoobdubt.supabase.co',
  
  // Chave anônima do Supabase
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ',
  
  // Validar se as configurações estão disponíveis
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.url) {
      errors.push('VITE_SUPABASE_URL não está definida');
    }
    
    if (!this.anonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY não está definida');
    }
    
    // Validar formato da URL
    if (this.url && !this.url.startsWith('https://')) {
      errors.push('VITE_SUPABASE_URL deve começar com https://');
    }
    
    // Validar se a chave parece ser um JWT válido
    if (this.anonKey && !this.anonKey.startsWith('eyJ')) {
      errors.push('VITE_SUPABASE_ANON_KEY deve ser um token JWT válido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  // Obter configurações seguras (sem expor credenciais nos logs)
  getSafeConfig() {
    return {
      url: this.url ? `${this.url.substring(0, 20)}...` : 'not configured',
      anonKey: this.anonKey ? `${this.anonKey.substring(0, 10)}...` : 'not configured',
      isConfigured: !!(this.url && this.anonKey)
    };
  }
};

// Validar configuração na inicialização (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  const validation = SUPABASE_CONFIG.validate();
  if (!validation.isValid) {
    console.warn('⚠️ [SUPABASE CONFIG] Problemas de configuração detectados:', validation.errors);
    console.info('ℹ️ [SUPABASE CONFIG] Usando valores de fallback para desenvolvimento');
  } else {
    console.info('✅ [SUPABASE CONFIG] Configuração validada com sucesso');
  }
}
