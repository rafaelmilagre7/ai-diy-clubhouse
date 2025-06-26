
import { logger } from '@/utils/logger';

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

interface SupabaseConfig {
  isLovableEnvironment: () => boolean;
  getCredentials: () => SupabaseCredentials;
  getSafeConfig: () => { hasUrl: boolean; hasKey: boolean; environment: string };
  // Novos métodos para compatibilidade
  validate: () => { isValid: boolean; environment: string };
  isConfigured: () => boolean;
  url: string;
  anonKey: string;
}

class SupabaseConfigManager implements SupabaseConfig {
  private credentials: SupabaseCredentials | null = null;

  constructor() {
    this.initializeCredentials();
  }

  private initializeCredentials(): void {
    try {
      logger.info('[SUPABASE-CONFIG] 🔧 Inicializando configuração', {
        component: 'SupabaseConfig',
        action: 'initialize'
      });

      // Tentar diferentes variáveis de ambiente em ordem de prioridade
      const possibleUrls = [
        import.meta.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_URL,
        'https://zotzvtepvpnkcoobdubt.supabase.co' // Fallback hardcoded
      ];

      const possibleKeys = [
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        process.env.VITE_SUPABASE_ANON_KEY,
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ' // Fallback hardcoded
      ];

      const url = possibleUrls.find(u => u && u.trim() !== '');
      const anonKey = possibleKeys.find(k => k && k.trim() !== '');

      if (!url || !anonKey) {
        const missing = [];
        if (!url) missing.push('URL');
        if (!anonKey) missing.push('ANON_KEY');
        
        throw new Error(`Credenciais Supabase faltando: ${missing.join(', ')}`);
      }

      this.credentials = { url, anonKey };

      logger.info('[SUPABASE-CONFIG] ✅ Configuração carregada com sucesso', {
        component: 'SupabaseConfig',
        action: 'credentials_loaded',
        hasUrl: !!url,
        hasKey: !!anonKey,
        environment: this.isLovableEnvironment() ? 'Lovable' : 'Custom'
      });

    } catch (error) {
      logger.error('[SUPABASE-CONFIG] ❌ Erro ao carregar configuração', {
        component: 'SupabaseConfig',
        action: 'initialization_error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      // Em caso de erro, usar credenciais de fallback
      this.credentials = {
        url: 'https://zotzvtepvpnkcoobdubt.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ'
      };

      logger.warn('[SUPABASE-CONFIG] ⚠️ Usando credenciais de fallback', {
        component: 'SupabaseConfig',
        action: 'fallback_credentials'
      });
    }
  }

  public isLovableEnvironment(): boolean {
    return window.location.hostname.includes('lovable.app') || 
           window.location.hostname.includes('lovable.dev');
  }

  public getCredentials(): SupabaseCredentials {
    if (!this.credentials) {
      throw new Error('Configuração Supabase não inicializada');
    }
    return this.credentials;
  }

  public getSafeConfig(): { hasUrl: boolean; hasKey: boolean; environment: string } {
    return {
      hasUrl: !!(this.credentials?.url),
      hasKey: !!(this.credentials?.anonKey),
      environment: this.isLovableEnvironment() ? 'Lovable' : 'Custom'
    };
  }

  // Novos métodos para compatibilidade
  public validate(): { isValid: boolean; environment: string } {
    const hasCredentials = !!(this.credentials?.url && this.credentials?.anonKey);
    return {
      isValid: hasCredentials,
      environment: this.isLovableEnvironment() ? 'Lovable' : 'Custom'
    };
  }

  public isConfigured(): boolean {
    return !!(this.credentials?.url && this.credentials?.anonKey);
  }

  public get url(): string {
    return this.credentials?.url || '';
  }

  public get anonKey(): string {
    return this.credentials?.anonKey || '';
  }

  // Método para obter domínio da aplicação
  public getAppDomain(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return 'https://app.viverdeia.ai'; // Fallback para produção
  }
}

export const SUPABASE_CONFIG = new SupabaseConfigManager();

// APP_CONFIG para compatibilidade com código existente
export const APP_CONFIG = {
  getAppDomain: () => SUPABASE_CONFIG.getAppDomain(),
  supabaseUrl: SUPABASE_CONFIG.url,
  supabaseAnonKey: SUPABASE_CONFIG.anonKey,
  isLovableEnvironment: () => SUPABASE_CONFIG.isLovableEnvironment(),
  validate: () => SUPABASE_CONFIG.validate(),
  isConfigured: () => SUPABASE_CONFIG.isConfigured()
};
