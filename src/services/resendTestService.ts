
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
  private readonly defaultTimeout = 15000;
  private readonly maxRetries = 2;

  constructor() {
    const credentials = SUPABASE_CONFIG.getCredentials();
    this.baseUrl = `${credentials.url}/functions/v1`;
  }

  private log(level: 'info' | 'error' | 'warn', message: string, context?: any) {
    const logMessage = context ? `${message}: ${JSON.stringify(context)}` : message;
    console[level](`[RESEND-SERVICE] ${logMessage}`);
  }

  private async makeRequestWithRetry<T>(
    url: string,
    options: RequestInit,
    retries = this.maxRetries
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      try {
        this.log('info', `Tentativa ${attempt}/${retries + 1} para ${url}`);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        this.log('info', `Sucesso na tentativa ${attempt}`, result);
        return result;
      } catch (error: any) {
        clearTimeout(timeoutId);
        this.log('error', `Falha na tentativa ${attempt}`, error);

        if (attempt === retries + 1) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('Todas as tentativas falharam');
  }

  async testHealthWithDirectFetch(
    attempt: number = 1,
    forceRefresh: boolean = false
  ): Promise<ResendHealthResponse> {
    try {
      this.log('info', `Teste de saúde - tentativa ${attempt}`);

      const result = await this.makeRequestWithRetry<ResendHealthResponse>(
        `${this.baseUrl}/test-resend-health`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_CONFIG.getCredentials().anonKey}`,
            'apikey': SUPABASE_CONFIG.getCredentials().anonKey,
            'X-Client-Info': 'viverdeia-improved-test'
          },
          body: JSON.stringify({
            forceRefresh,
            attempt,
            timestamp: new Date().toISOString(),
            testType: 'improved_connectivity'
          })
        }
      );

      this.log('info', 'Teste de saúde bem-sucedido', result);
      return result;
    } catch (error: any) {
      this.log('error', 'Erro no teste de saúde', error);

      return {
        healthy: false,
        apiKeyValid: false,
        connectivity: 'error',
        domainValid: false,
        issues: [`Conectividade falhada: ${error.message}`],
        lastError: error.message,
        timestamp: new Date().toISOString(),
        attempt
      };
    }
  }

  async sendTestEmailDirect(email: string): Promise<ResendTestEmailResponse> {
    try {
      this.log('info', `Enviando email de teste para: ${email}`);

      const result = await this.makeRequestWithRetry<ResendTestEmailResponse>(
        `${this.baseUrl}/test-resend-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_CONFIG.getCredentials().anonKey}`,
            'apikey': SUPABASE_CONFIG.getCredentials().anonKey,
            'X-Client-Info': 'viverdeia-improved-email'
          },
          body: JSON.stringify({ email })
        }
      );

      this.log('info', 'Email enviado com sucesso', result);
      return result;
    } catch (error: any) {
      this.log('error', 'Erro no envio de email', error);

      return {
        success: false,
        error: `Falha no envio: ${error.message}`
      };
    }
  }

  // Método para testar se as Edge Functions estão deployadas
  async testEdgeFunctionDeployment(): Promise<{ 
    deployed: boolean; 
    functions: string[]; 
    errors: string[] 
  }> {
    const functions = ['test-resend-health', 'test-resend-email', 'send-invite-email', 'send-fallback-notification'];
    const results = { deployed: true, functions: [], errors: [] };

    for (const funcName of functions) {
      try {
        const response = await fetch(`${this.baseUrl}/${funcName}`, {
          method: 'OPTIONS',
          headers: {
            'Authorization': `Bearer ${SUPABASE_CONFIG.getCredentials().anonKey}`,
            'apikey': SUPABASE_CONFIG.getCredentials().anonKey
          }
        });

        if (response.status === 404) {
          results.deployed = false;
          results.errors.push(`Function ${funcName} não encontrada`);
        } else {
          results.functions.push(funcName);
        }
      } catch (error: any) {
        results.deployed = false;
        results.errors.push(`Erro ao testar ${funcName}: ${error.message}`);
      }
    }

    return results;
  }
}

export const resendTestService = new ResendTestService();
