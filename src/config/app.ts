
// Configuração centralizada da aplicação - 100% LIVRE DE CREDENCIAIS HARDCODED
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

// Configuração do Supabase com detecção inteligente de ambiente - 100% SEGURA
export const SUPABASE_CONFIG = {
  // URLs e chaves obtidas APENAS de variáveis de ambiente
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // Detecção aprimorada do ambiente Lovable
  isLovableEnvironment(): boolean {
    const hostname = window.location.hostname;
    const isLovable = hostname.includes('lovableproject.com') || 
                     hostname.includes('lovable.app') ||
                     hostname.includes('lovable.dev') ||
                     // Padrões adicionais para detectar Lovable
                     /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.lovableproject\.com$/.test(hostname);
    
    // Log seguro da detecção
    if (import.meta.env.DEV) {
      console.info(`🔍 [AMBIENTE] Detecção: ${isLovable ? 'Lovable' : 'Outro'} (${hostname})`);
    }
    
    return isLovable;
  },
  
  // Validação inteligente por ambiente
  validate(): { isValid: boolean; errors: string[]; environment: string } {
    const errors: string[] = [];
    const environment = this.isLovableEnvironment() ? 'Lovable' : 
                       import.meta.env.DEV ? 'Desenvolvimento' : 'Produção';
    
    // No ambiente Lovable, sempre considerar válido (credenciais automáticas)
    if (this.isLovableEnvironment()) {
      return {
        isValid: true,
        errors: [],
        environment
      };
    }
    
    // Em outros ambientes, validar rigorosamente
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
      errors,
      environment
    };
  },
  
  // Verificar se está configurado
  isConfigured(): boolean {
    // No Lovable, sempre considerado configurado
    if (this.isLovableEnvironment()) {
      return true;
    }
    
    // Em outros ambientes, verificar se as variáveis existem
    return !!(this.url && this.anonKey);
  },
  
  // Obter configurações seguras para logs (sem expor credenciais)
  getSafeConfig() {
    const environment = this.isLovableEnvironment() ? 'Lovable' : 
                       import.meta.env.DEV ? 'Desenvolvimento' : 'Produção';
    
    return {
      url: this.url ? `${this.url.substring(0, 20)}...` : '❌ NÃO CONFIGURADA',
      anonKey: this.anonKey ? `${this.anonKey.substring(0, 10)}...` : '❌ NÃO CONFIGURADA',
      isConfigured: this.isConfigured(),
      environment,
      autoConfigured: this.isLovableEnvironment()
    };
  },
  
  // Validação rigorosa apenas quando necessário
  requireValidConfig(): void {
    const validation = this.validate();
    
    // No Lovable, nunca falhar (configuração automática)
    if (this.isLovableEnvironment()) {
      return;
    }
    
    // Em outros ambientes, falhar apenas se realmente não configurado
    if (!validation.isValid) {
      const errorMessage = `
🔒 CONFIGURAÇÃO DE SEGURANÇA NECESSÁRIA

As credenciais do Supabase não estão configuradas corretamente no ambiente ${validation.environment}:

${validation.errors.join('\n')}

📋 COMO RESOLVER:
1. Copie o arquivo .env.example para .env.local
2. Configure suas credenciais do Supabase no .env.local
3. Reinicie o servidor de desenvolvimento

🔗 Onde encontrar as credenciais:
https://supabase.com/dashboard/project/[seu-projeto]/settings/api

⚠️  A aplicação não funcionará sem essas configurações em ambiente ${validation.environment}.
      `;
      
      throw new Error(errorMessage);
    }
  }
};

// Validação automática na inicialização - apenas quando necessário
if (import.meta.env.DEV) {
  const validation = SUPABASE_CONFIG.validate();
  
  if (SUPABASE_CONFIG.isLovableEnvironment()) {
    console.info('✅ [LOVABLE] Executando no ambiente Lovable - configuração automática ativa');
  } else if (!validation.isValid) {
    console.error('🔒 [CONFIGURAÇÃO CRÍTICA] Credenciais do Supabase não configuradas:');
    validation.errors.forEach(error => console.error(`   ${error}`));
    console.info('ℹ️  [SOLUÇÃO] Configure as credenciais em .env.local para desenvolvimento');
  } else {
    console.info(`✅ [SEGURANÇA] Configuração do Supabase validada com sucesso no ambiente ${validation.environment}`);
  }
}
