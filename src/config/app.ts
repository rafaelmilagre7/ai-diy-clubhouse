
// Configuração centralizada da aplicação - 100% SEGURA SEM CREDENCIAIS HARDCODED
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

// Configuração do Supabase COMPLETAMENTE SEGURA - SEM CREDENCIAIS HARDCODED
export const SUPABASE_CONFIG = {
  // DETECÇÃO CORRIGIDA DO AMBIENTE LOVABLE
  isLovableEnvironment(): boolean {
    const hostname = window.location.hostname;
    const isLovable =
      hostname.includes('lovableproject.com') ||
      hostname.includes('lovable.app') ||
      hostname.includes('lovable.dev') ||
      hostname === "app.viverdeia.ai" ||
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.lovableproject\.com$/.test(hostname);

    // Log seguro da detecção
    if (import.meta.env.DEV) {
      console.info(
        `🔍 [AMBIENTE] Detecção: ${isLovable ? "Lovable" : "Outro"} (${hostname})`
      );
    }

    return isLovable;
  },

  // Obter credenciais EXCLUSIVAMENTE de variáveis de ambiente - MÉTODO SEGURO
  getCredentials(): { url: string; anonKey: string } {
    // SEMPRE usar variáveis de ambiente - sem fallbacks hardcoded
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (envUrl && envKey) {
      if (import.meta.env.DEV) {
        console.info('✅ [SEGURO] Usando credenciais das variáveis de ambiente');
      }
      return { url: envUrl, anonKey: envKey };
    }
    
    // SEGURANÇA: Se não há credenciais, retornar vazio ao invés de fallback inseguro
    if (import.meta.env.DEV) {
      console.warn('⚠️ [SEGURANÇA] Credenciais não configuradas nas variáveis de ambiente');
    }
    
    return { url: '', anonKey: '' };
  },

  // URLs e chaves obtidas dinamicamente e de forma segura
  get url(): string {
    return this.getCredentials().url;
  },

  get anonKey(): string {
    return this.getCredentials().anonKey;
  },
  
  // Validação inteligente por ambiente - MÉTODO SEGURO
  validate(): { isValid: boolean; errors: string[]; environment: string } {
    const errors: string[] = [];
    const environment = this.isLovableEnvironment() ? 'Lovable' : 
                       import.meta.env.DEV ? 'Desenvolvimento' : 'Produção';
    
    const credentials = this.getCredentials();
    
    // Validação consistente para todos os ambientes
    if (!credentials.url) {
      errors.push('❌ VITE_SUPABASE_URL não está definida - Configure nas variáveis de ambiente');
    }
    
    if (!credentials.anonKey) {
      errors.push('❌ VITE_SUPABASE_ANON_KEY não está definida - Configure nas variáveis de ambiente');
    }
    
    // Validar formato da URL
    if (credentials.url && !credentials.url.startsWith('https://')) {
      errors.push('❌ VITE_SUPABASE_URL deve começar com https://');
    }
    
    // Validar se a chave parece ser um JWT válido
    if (credentials.anonKey && !credentials.anonKey.startsWith('eyJ')) {
      errors.push('❌ VITE_SUPABASE_ANON_KEY deve ser um token JWT válido');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      environment
    };
  },
  
  // Verificar se está configurado de forma segura
  isConfigured(): boolean {
    const credentials = this.getCredentials();
    return !!(credentials.url && credentials.anonKey);
  },
  
  // Obter configurações seguras para logs (sem expor credenciais)
  getSafeConfig() {
    const credentials = this.getCredentials();
    const environment = this.isLovableEnvironment() ? 'Lovable' : 
                       import.meta.env.DEV ? 'Desenvolvimento' : 'Produção';
    
    return {
      url: credentials.url ? `${credentials.url.substring(0, 20)}...` : '❌ NÃO CONFIGURADA',
      anonKey: credentials.anonKey ? `${credentials.anonKey.substring(0, 10)}...` : '❌ NÃO CONFIGURADA',
      isConfigured: this.isConfigured(),
      environment,
      secureMode: true // Indica que estamos em modo seguro
    };
  },
  
  // Validação rigorosa para garantir segurança
  requireValidConfig(): void {
    const validation = this.validate();
    
    if (!validation.isValid) {
      const errorMessage = `
🔒 CONFIGURAÇÃO DE SEGURANÇA NECESSÁRIA

As credenciais do Supabase não estão configuradas corretamente no ambiente ${validation.environment}:

${validation.errors.join('\n')}

📋 COMO RESOLVER:
1. Configure VITE_SUPABASE_URL nas variáveis de ambiente do projeto
2. Configure VITE_SUPABASE_ANON_KEY nas variáveis de ambiente do projeto
3. Verifique se as credenciais estão corretas no dashboard do Supabase

🔗 Onde encontrar as credenciais:
https://supabase.com/dashboard/project/[seu-projeto]/settings/api

⚠️  A aplicação não funcionará sem essas configurações de segurança.
      `;
      
      throw new Error(errorMessage);
    }
  }
};

// Validação automática na inicialização - MODO SEGURO
if (import.meta.env.DEV) {
  const validation = SUPABASE_CONFIG.validate();
  const safeConfig = SUPABASE_CONFIG.getSafeConfig();
  
  if (validation.isValid) {
    console.info(`✅ [SEGURANÇA] Configuração do Supabase validada com sucesso no ambiente ${validation.environment}`);
    console.info('🔒 [SEGURANÇA] Modo seguro ativado - sem credenciais hardcoded');
  } else {
    console.error(`🔒 [CONFIGURAÇÃO CRÍTICA] Credenciais do Supabase não configuradas no ambiente ${validation.environment}:`);
    validation.errors.forEach(error => console.error(`   ${error}`));
    console.info('ℹ️  [SOLUÇÃO] Configure as credenciais nas variáveis de ambiente do projeto');
  }
  
  console.info('🔒 [CONFIGURAÇÃO SEGURA]', safeConfig);
}
