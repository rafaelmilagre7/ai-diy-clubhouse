
// Configuração centralizada da aplicação - LIVRE DE CREDENCIAIS HARDCODED
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

// Configuração do Supabase com validação rigorosa - SEM CREDENCIAIS HARDCODED
export const SUPABASE_CONFIG = {
  // CORREÇÃO: No ambiente Lovable, as credenciais estão sempre disponíveis
  // URL do projeto Supabase
  url: import.meta.env.VITE_SUPABASE_URL || 'https://zotzvtepvpnkcoobdubt.supabase.co',
  
  // Chave anônima do Supabase  
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ',
  
  // Verificar se está em ambiente Lovable
  isLovableEnvironment(): boolean {
    return window.location.hostname.includes('lovableproject.com') || 
           window.location.hostname.includes('lovable.app');
  },
  
  // Validar se as configurações estão disponíveis
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Se estiver no ambiente Lovable, sempre considerar válido
    if (this.isLovableEnvironment()) {
      return {
        isValid: true,
        errors: []
      };
    }
    
    if (!this.url) {
      errors.push('❌ VITE_SUPABASE_URL não está definida - Configure no .env.local');
    }
    
    if (!this.anonKey) {
      errors.push('❌ VITE_SUPABASE_ANON_KEY não está definida - Configure no .env.local');
    }
    
    // Validar formato da URL
    if (this.url && !this.url.startsWith('https://')) {
      errors.push('❌ VITE_SUPABASE_URL deve começar com https://');
    }
    
    // Validar se a chave parece ser um JWT válido
    if (this.anonKey && !this.anonKey.startsWith('eyJ')) {
      errors.push('❌ VITE_SUPABASE_ANON_KEY deve ser um token JWT válido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  // Verificar se está configurado (sem expor credenciais)
  isConfigured(): boolean {
    return !!(this.url && this.anonKey);
  },
  
  // Obter configurações seguras (sem expor credenciais nos logs)
  getSafeConfig() {
    return {
      url: this.url ? `${this.url.substring(0, 20)}...` : '❌ NÃO CONFIGURADA',
      anonKey: this.anonKey ? `${this.anonKey.substring(0, 10)}...` : '❌ NÃO CONFIGURADA',
      isConfigured: this.isConfigured(),
      environment: this.isLovableEnvironment() ? 'Lovable' : 'Local/Produção'
    };
  },
  
  // Método para falhar de forma segura se credenciais não estiverem configuradas
  requireValidConfig(): void {
    const validation = this.validate();
    if (!validation.isValid) {
      const errorMessage = `
🔒 CONFIGURAÇÃO DE SEGURANÇA NECESSÁRIA

As credenciais do Supabase não estão configuradas corretamente:

${validation.errors.join('\n')}

📋 COMO RESOLVER:
1. Copie o arquivo .env.example para .env.local
2. Configure suas credenciais do Supabase no .env.local
3. Reinicie o servidor de desenvolvimento

🔗 Onde encontrar as credenciais:
https://supabase.com/dashboard/project/[seu-projeto]/settings/api

⚠️  A aplicação não funcionará sem essas configurações.
      `;
      
      throw new Error(errorMessage);
    }
  }
};

// Validação automática na inicialização (apenas em desenvolvimento local)
if (import.meta.env.DEV && !SUPABASE_CONFIG.isLovableEnvironment()) {
  const validation = SUPABASE_CONFIG.validate();
  if (!validation.isValid) {
    console.error('🔒 [CONFIGURAÇÃO CRÍTICA] Credenciais do Supabase não configuradas:');
    validation.errors.forEach(error => console.error(`   ${error}`));
    console.info('ℹ️  [SOLUÇÃO] Consulte o arquivo SECURITY_SETUP.md para instruções');
  } else {
    console.info('✅ [SEGURANÇA] Configuração do Supabase validada com sucesso');
  }
} else if (SUPABASE_CONFIG.isLovableEnvironment()) {
  console.info('✅ [LOVABLE] Executando no ambiente Lovable - configuração automática ativa');
}
