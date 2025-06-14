
// Configuração centralizada da aplicação com Supabase Secrets
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

// Cache para credenciais do Supabase
interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

interface CachedCredentials {
  credentials: SupabaseCredentials;
  timestamp: number;
  ttl: number;
}

// Cache global das credenciais
let credentialsCache: CachedCredentials | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

// Configuração do Supabase com Supabase Secrets
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

    return isLovable;
  },

  // Buscar credenciais via Supabase Secrets (com cache)
  async getCredentials(): Promise<SupabaseCredentials> {
    // Verificar cache primeiro
    if (credentialsCache && (Date.now() - credentialsCache.timestamp) < credentialsCache.ttl) {
      if (import.meta.env.DEV) {
        console.info('🔧 [SUPABASE] Usando credenciais do cache');
      }
      return credentialsCache.credentials;
    }

    try {
      // Fallback para variáveis de ambiente (desenvolvimento local)
      const envUrl = import.meta.env.VITE_SUPABASE_URL;
      const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (envUrl && envKey) {
        if (import.meta.env.DEV) {
          console.info('🔧 [SUPABASE] Usando credenciais das variáveis de ambiente (desenvolvimento)');
        }
        
        const credentials = { url: envUrl, anonKey: envKey };
        
        // Cachear também as credenciais de ambiente
        credentialsCache = {
          credentials,
          timestamp: Date.now(),
          ttl: CACHE_TTL
        };
        
        return credentials;
      }

      // Buscar via edge function (produção/Lovable)
      if (import.meta.env.DEV) {
        console.info('🔧 [SUPABASE] Buscando credenciais via Supabase Secrets...');
      }

      const response = await fetch('/functions/v1/get-supabase-config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao buscar credenciais');
      }

      const credentials = {
        url: data.url,
        anonKey: data.anonKey
      };

      // Atualizar cache
      credentialsCache = {
        credentials,
        timestamp: Date.now(),
        ttl: CACHE_TTL
      };

      if (import.meta.env.DEV) {
        console.info('✅ [SUPABASE] Credenciais obtidas via Supabase Secrets');
      }

      return credentials;

    } catch (error) {
      console.error('❌ [SUPABASE] Erro ao buscar credenciais:', error);
      throw new Error('Não foi possível obter as credenciais do Supabase');
    }
  },

  // URLs e chaves obtidas dinamicamente de forma assíncrona
  async getUrl(): Promise<string> {
    const credentials = await this.getCredentials();
    return credentials.url;
  },

  async getAnonKey(): Promise<string> {
    const credentials = await this.getCredentials();
    return credentials.anonKey;
  },
  
  // Validação assíncrona por ambiente
  async validate(): Promise<{ isValid: boolean; errors: string[]; environment: string }> {
    const errors: string[] = [];
    const environment = this.isLovableEnvironment() ? 'Lovable' : 
                       import.meta.env.DEV ? 'Desenvolvimento' : 'Produção';
    
    try {
      const credentials = await this.getCredentials();
      
      // Validação consistente para todos os ambientes
      if (!credentials.url) {
        errors.push('❌ URL do Supabase não está disponível');
      }
      
      if (!credentials.anonKey) {
        errors.push('❌ Chave anônima do Supabase não está disponível');
      }
      
      // Validar formato da URL
      if (credentials.url && !credentials.url.startsWith('https://')) {
        errors.push('❌ URL do Supabase deve começar com https://');
      }
      
      // Validar se a chave parece ser um JWT válido
      if (credentials.anonKey && !credentials.anonKey.startsWith('eyJ')) {
        errors.push('❌ Chave anônima do Supabase deve ser um token JWT válido');
      }
      
    } catch (error: any) {
      errors.push(`❌ Erro ao validar credenciais: ${error.message}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      environment
    };
  },
  
  // Verificar se está configurado de forma assíncrona
  async isConfigured(): Promise<boolean> {
    try {
      const credentials = await this.getCredentials();
      return !!(credentials.url && credentials.anonKey);
    } catch {
      return false;
    }
  },
  
  // Obter configurações seguras para logs (sem expor credenciais)
  async getSafeConfig() {
    try {
      const credentials = await this.getCredentials();
      const environment = this.isLovableEnvironment() ? 'Lovable' : 
                         import.meta.env.DEV ? 'Desenvolvimento' : 'Produção';
      
      return {
        url: credentials.url ? `${credentials.url.substring(0, 20)}...` : '❌ NÃO CONFIGURADA',
        anonKey: credentials.anonKey ? `${credentials.anonKey.substring(0, 10)}...` : '❌ NÃO CONFIGURADA',
        isConfigured: true,
        environment,
        secureMode: true,
        cacheStatus: credentialsCache ? 'cached' : 'fresh'
      };
    } catch (error) {
      return {
        url: '❌ NÃO CONFIGURADA',
        anonKey: '❌ NÃO CONFIGURADA',
        isConfigured: false,
        environment: 'ERROR',
        secureMode: true,
        error: (error as Error).message
      };
    }
  },
  
  // Validação rigorosa assíncrona para garantir segurança
  async requireValidConfig(): Promise<void> {
    const validation = await this.validate();
    
    if (!validation.isValid) {
      const errorMessage = `
🔒 CONFIGURAÇÃO DE SEGURANÇA NECESSÁRIA

As credenciais do Supabase não estão configuradas corretamente no ambiente ${validation.environment}:

${validation.errors.join('\n')}

📋 COMO RESOLVER:
1. Configure VITE_SUPABASE_URL nos Supabase Secrets
2. Configure VITE_SUPABASE_ANON_KEY nos Supabase Secrets
3. Verifique se as credenciais estão corretas no dashboard do Supabase

🔗 Onde encontrar as credenciais:
https://supabase.com/dashboard/project/[seu-projeto]/settings/api

⚠️  A aplicação não funcionará sem essas configurações de segurança.
      `;
      
      throw new Error(errorMessage);
    }
  },

  // Limpar cache (útil para debug ou reload forçado)
  clearCache(): void {
    credentialsCache = null;
    if (import.meta.env.DEV) {
      console.info('🔧 [SUPABASE] Cache de credenciais limpo');
    }
  }
};

// Validação automática assíncrona na inicialização
if (import.meta.env.DEV) {
  SUPABASE_CONFIG.validate().then(validation => {
    SUPABASE_CONFIG.getSafeConfig().then(safeConfig => {
      if (validation.isValid) {
        console.info(`✅ [SEGURANÇA] Configuração do Supabase validada com sucesso no ambiente ${validation.environment}`);
        console.info('🔒 [SEGURANÇA] Modo seguro ativado com Supabase Secrets');
      } else {
        console.error(`🔒 [CONFIGURAÇÃO CRÍTICA] Credenciais do Supabase não configuradas no ambiente ${validation.environment}:`);
        validation.errors.forEach(error => console.error(`   ${error}`));
        console.info('ℹ️  [SOLUÇÃO] Configure as credenciais nos Supabase Secrets do projeto');
      }
      
      console.info('🔒 [CONFIGURAÇÃO SEGURA]', safeConfig);
    });
  });
}
