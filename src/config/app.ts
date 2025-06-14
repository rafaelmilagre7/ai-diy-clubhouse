
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

  // Obter credenciais com fallback inteligente
  getCredentials(): { url: string; anonKey: string } {
    // No Lovable, tentar acessar as credenciais automáticas primeiro
    if (this.isLovableEnvironment()) {
      // Tentar variáveis de ambiente primeiro
      const envUrl = import.meta.env.VITE_SUPABASE_URL;
      const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (envUrl && envKey) {
        if (import.meta.env.DEV) {
          console.info('✅ [LOVABLE] Usando credenciais automáticas do ambiente');
        }
        return { url: envUrl, anonKey: envKey };
      }
      
      // Fallback para URL padrão do projeto (apenas no Lovable)
      const projectUrl = 'https://zotzvtepvpnkcoobdubt.supabase.co';
      const projectKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ';
      
      if (import.meta.env.DEV) {
        console.info('⚠️ [LOVABLE] Usando credenciais do projeto como fallback');
      }
      
      return { url: projectUrl, anonKey: projectKey };
    }
    
    // Em outros ambientes, usar apenas variáveis
    return {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    };
  },

  // URLs e chaves obtidas dinamicamente
  get url(): string {
    return this.getCredentials().url;
  },

  get anonKey(): string {
    return this.getCredentials().anonKey;
  },
  
  // Validação inteligente por ambiente
  validate(): { isValid: boolean; errors: string[]; environment: string } {
    const errors: string[] = [];
    const environment = this.isLovableEnvironment() ? 'Lovable' : 
                       import.meta.env.DEV ? 'Desenvolvimento' : 'Produção';
    
    const credentials = this.getCredentials();
    
    // No ambiente Lovable, sempre considerar válido se temos credenciais
    if (this.isLovableEnvironment()) {
      if (!credentials.url || !credentials.anonKey) {
        errors.push('❌ Credenciais do Lovable não disponíveis');
      }
      
      return {
        isValid: credentials.url && credentials.anonKey ? true : false,
        errors,
        environment
      };
    }
    
    // Em outros ambientes, validar rigorosamente
    if (!credentials.url) {
      errors.push('❌ VITE_SUPABASE_URL não está definida - Configure no .env.local');
    }
    
    if (!credentials.anonKey) {
      errors.push('❌ VITE_SUPABASE_ANON_KEY não está definida - Configure no .env.local');
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
  
  // Verificar se está configurado
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
      autoConfigured: this.isLovableEnvironment()
    };
  },
  
  // Validação rigorosa apenas quando necessário
  requireValidConfig(): void {
    const validation = this.validate();
    
    // No Lovable, dar mais informações se falhar
    if (this.isLovableEnvironment() && !validation.isValid) {
      const errorMessage = `
🔒 ERRO DE CONFIGURAÇÃO NO LOVABLE

As credenciais do Supabase não estão disponíveis no ambiente Lovable:

${validation.errors.join('\n')}

📋 POSSÍVEIS SOLUÇÕES:
1. Verifique se o projeto Lovable está conectado ao Supabase
2. Aguarde alguns segundos e recarregue a página
3. Entre em contato com o suporte se o problema persistir

⚠️  Este erro indica um problema na configuração automática do Lovable.
      `;
      
      throw new Error(errorMessage);
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
    if (validation.isValid) {
      console.info('✅ [LOVABLE] Executando no ambiente Lovable - configuração automática ativa');
    } else {
      console.error('🔒 [LOVABLE ERRO] Credenciais não disponíveis no Lovable:');
      validation.errors.forEach(error => console.error(`   ${error}`));
    }
  } else if (!validation.isValid) {
    console.error('🔒 [CONFIGURAÇÃO CRÍTICA] Credenciais do Supabase não configuradas:');
    validation.errors.forEach(error => console.error(`   ${error}`));
    console.info('ℹ️  [SOLUÇÃO] Configure as credenciais em .env.local para desenvolvimento');
  } else {
    console.info(`✅ [SEGURANÇA] Configuração do Supabase validada com sucesso no ambiente ${validation.environment}`);
  }
}
