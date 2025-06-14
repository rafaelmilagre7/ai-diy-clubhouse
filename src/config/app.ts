
/**
 * Configuração Central da Aplicação - CORREÇÃO CRÍTICA PARA LOGIN
 * Sistema de configuração seguro com fallback robusto
 */

import { logger } from '@/utils/logger';

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

interface ConfigResponse {
  url: string;
  anonKey: string;
  success: boolean;
  error?: string;
}

interface ValidationResult {
  isValid: boolean;
  environment: string;
  issues: string[];
}

interface SafeConfig {
  hasUrl: boolean;
  hasKey: boolean;
  secureMode: boolean;
  source: string;
}

class SupabaseConfig {
  private static instance: SupabaseConfig;
  private credentials: SupabaseCredentials | null = null;
  private initialized = false;
  private initPromise: Promise<SupabaseCredentials> | null = null;

  private constructor() {}

  static getInstance(): SupabaseConfig {
    if (!SupabaseConfig.instance) {
      SupabaseConfig.instance = new SupabaseConfig();
    }
    return SupabaseConfig.instance;
  }

  /**
   * CORREÇÃO CRÍTICA: Obter credenciais com fallback robusto
   */
  async getCredentials(): Promise<SupabaseCredentials> {
    if (this.credentials && this.initialized) {
      return this.credentials;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initializeCredentials();
    return this.initPromise;
  }

  private async initializeCredentials(): Promise<SupabaseCredentials> {
    logger.info('🔧 [CONFIG] Inicializando credenciais Supabase...');

    // CORREÇÃO 1: Verificar variáveis de ambiente primeiro
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // CORREÇÃO TEMPORÁRIA: Credenciais hardcoded para teste
    const tempUrl = 'https://zotzvtepvpnkcoobdubt.supabase.co';
    const tempKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ';

    if (envUrl && envKey) {
      logger.info('✅ [CONFIG] Usando credenciais das variáveis de ambiente');
      this.credentials = { url: envUrl, anonKey: envKey };
      this.initialized = true;
      return this.credentials;
    }

    // CORREÇÃO 2: Tentar Edge Function com URL correta
    try {
      logger.info('🔧 [CONFIG] Tentando buscar credenciais via Edge Function...');
      
      // URL CORRIGIDA: Usar URL completa do projeto Supabase
      const response = await fetch(`${tempUrl}/functions/v1/get-supabase-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Edge Function retornou ${response.status}: ${response.statusText}`);
      }

      const data: ConfigResponse = await response.json();
      
      if (data.success && data.url && data.anonKey) {
        logger.info('✅ [CONFIG] Credenciais obtidas da Edge Function');
        this.credentials = { url: data.url, anonKey: data.anonKey };
        this.initialized = true;
        return this.credentials;
      } else {
        throw new Error(data.error || 'Credenciais inválidas da Edge Function');
      }
    } catch (error) {
      logger.warn('⚠️ [CONFIG] Edge Function falhou:', error);
    }

    // CORREÇÃO 3: Fallback para credenciais temporárias
    logger.warn('⚠️ [CONFIG] Usando credenciais temporárias (fallback)');
    this.credentials = { url: tempUrl, anonKey: tempKey };
    this.initialized = true;
    return this.credentials;
  }

  /**
   * Obter apenas a URL do Supabase
   */
  async getUrl(): Promise<string> {
    const credentials = await this.getCredentials();
    return credentials.url;
  }

  /**
   * Obter apenas a chave anônima
   */
  async getAnonKey(): Promise<string> {
    const credentials = await this.getCredentials();
    return credentials.anonKey;
  }

  /**
   * Verificar se as credenciais estão configuradas
   */
  isConfigured(): boolean {
    return this.initialized && !!this.credentials;
  }

  /**
   * Validar configuração atual
   */
  async validate(): Promise<ValidationResult> {
    try {
      const credentials = await this.getCredentials();
      const issues: string[] = [];

      if (!credentials.url.startsWith('https://')) {
        issues.push('URL do Supabase inválida');
      }

      if (!credentials.anonKey.startsWith('eyJ')) {
        issues.push('Chave anônima inválida');
      }

      return {
        isValid: issues.length === 0,
        environment: import.meta.env.PROD ? 'Produção' : 'Desenvolvimento',
        issues
      };
    } catch (error) {
      return {
        isValid: false,
        environment: import.meta.env.PROD ? 'Produção' : 'Desenvolvimento',
        issues: [`Erro ao validar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      };
    }
  }

  /**
   * Obter configuração segura (para logs)
   */
  async getSafeConfig(): Promise<SafeConfig> {
    const credentials = await this.getCredentials();
    return {
      hasUrl: !!credentials.url,
      hasKey: !!credentials.anonKey,
      secureMode: true,
      source: import.meta.env.VITE_SUPABASE_URL ? 'environment' : 'edge_function_or_fallback'
    };
  }

  /**
   * Forçar re-inicialização (para testes)
   */
  reset(): void {
    this.credentials = null;
    this.initialized = false;
    this.initPromise = null;
  }
}

// Exportar instância singleton
export const SUPABASE_CONFIG = SupabaseConfig.getInstance();

// CORREÇÃO: Adicionar APP_CONFIG que está sendo esperado pelos outros arquivos
class AppConfig {
  private static instance: AppConfig;
  
  private constructor() {}
  
  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  getAppDomain(): string {
    return 'https://zotzvtepvpnkcoobdubt.supabase.co';
  }

  getAppUrl(path: string = ''): string {
    const baseUrl = import.meta.env.PROD 
      ? 'https://app.viverdeia.ai' 
      : window.location.origin;
    return `${baseUrl}${path}`;
  }

  isDevelopment(): boolean {
    return !import.meta.env.PROD;
  }

  isProduction(): boolean {
    return import.meta.env.PROD;
  }
}

// Exportar APP_CONFIG
export const APP_CONFIG = AppConfig.getInstance();
