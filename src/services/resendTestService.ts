
import { logger } from '@/utils/logger';
import { SUPABASE_CONFIG } from '@/config/app';

interface ResendHealthResponse {
  healthy: boolean;
  apiKeyValid: boolean;
  connectivity: 'connected' | 'disconnected' | 'error';
  domainValid: boolean;
  responseTime?: number;
  issues: string[];
  lastError?: string;
  timestamp?: string;
  attempt?: number;
}

interface ResendTestEmailResponse {
  success: boolean;
  emailId?: string;
  message?: string;
  error?: string;
}

class ResendTestService {
  private readonly baseUrl: string;
  private readonly defaultTimeout = 60000; // 60 segundos

  constructor() {
    const credentials = SUPABASE_CONFIG.getCredentials();
    this.baseUrl = `${credentials.url}/functions/v1`;
  }

  async testHealthWithDirectFetch(
    attempt: number = 1,
    forceRefresh: boolean = false
  ): Promise<ResendHealthResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

    try {
      logger.info(`🔧 [RESEND-DIRECT] Teste direto de saúde - tentativa ${attempt}`);

      const response = await fetch(`${this.baseUrl}/test-resend-health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_CONFIG.getCredentials().anonKey}`,
          'apikey': SUPABASE_CONFIG.getCredentials().anonKey,
          'X-Client-Info': 'viverdeia-direct-test'
        },
        body: JSON.stringify({
          forceRefresh,
          attempt,
          timestamp: new Date().toISOString(),
          testType: 'direct_fetch'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      logger.info('✅ [RESEND-DIRECT] Teste direto bem-sucedido:', result);

      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      logger.error('❌ [RESEND-DIRECT] Erro no teste direto:', error);

      return {
        healthy: false,
        apiKeyValid: false,
        connectivity: 'error',
        domainValid: false,
        issues: [`Erro direto: ${error.message}`],
        lastError: error.message,
        timestamp: new Date().toISOString(),
        attempt
      };
    }
  }

  async sendTestEmailDirect(email: string): Promise<ResendTestEmailResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

    try {
      logger.info('📧 [RESEND-DIRECT] Enviando email de teste direto:', email);

      const response = await fetch(`${this.baseUrl}/test-resend-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_CONFIG.getCredentials().anonKey}`,
          'apikey': SUPABASE_CONFIG.getCredentials().anonKey,
          'X-Client-Info': 'viverdeia-direct-email'
        },
        body: JSON.stringify({ email }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      logger.info('✅ [RESEND-DIRECT] Email enviado diretamente:', result);

      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      logger.error('❌ [RESEND-DIRECT] Erro no envio direto:', error);

      return {
        success: false,
        error: error.message
      };
    }
  }

  async testResendApiDirect(): Promise<{ connected: boolean; error?: string }> {
    try {
      logger.info('🔍 [RESEND-API] Testando conectividade direta com Resend API');

      // Teste básico de conectividade com Resend (sem Edge Function)
      const response = await fetch('https://api.resend.com/domains', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        logger.info('✅ [RESEND-API] Conectividade direta confirmada');
        return { connected: true };
      } else {
        logger.warn('⚠️ [RESEND-API] Resposta não-OK:', response.status);
        return { connected: false, error: `HTTP ${response.status}` };
      }
    } catch (error: any) {
      logger.error('❌ [RESEND-API] Erro na conectividade direta:', error);
      return { connected: false, error: error.message };
    }
  }
}

export const resendTestService = new ResendTestService();
