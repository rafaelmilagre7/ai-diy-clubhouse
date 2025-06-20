
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
  environment?: string;
  recommendations?: string[];
}

export const useWhatsAppDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);

  const runFullDiagnostic = async (): Promise<DiagnosticResult> => {
    setIsRunning(true);
    
    try {
      // Detectar ambiente
      const hostname = window.location.hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
      const environment = isLocal ? 'local' : 'production';
      
      const recommendations: string[] = [];
      let overallSuccess = true;
      const details: any = { environment };

      // Teste 1: Verificar se Edge Functions estão disponíveis
      try {
        const { data: configData, error: configError } = await supabase.functions.invoke('whatsapp-config-check', {
          body: { action: 'check_config' }
        });

        if (configError) {
          throw new Error(configError.message);
        }

        details.configCheck = configData;
        
        if (!configData.isValid) {
          overallSuccess = false;
          recommendations.push('Configure todas as variáveis de ambiente do WhatsApp no Supabase');
        }

      } catch (error) {
        overallSuccess = false;
        details.configError = error;
        
        if (environment === 'production') {
          recommendations.push('Faça deploy das Edge Functions usando: supabase functions deploy');
          recommendations.push('Verifique se as variáveis de ambiente estão configuradas no Supabase');
        } else {
          recommendations.push('Inicie o Supabase local: supabase start');
          recommendations.push('Configure as variáveis de ambiente no arquivo .env.local');
        }
      }

      // Teste 2: Verificar conectividade com WhatsApp API
      try {
        const { data: connectionData, error: connectionError } = await supabase.functions.invoke('whatsapp-config-check', {
          body: { action: 'test_connection' }
        });

        if (connectionError) {
          throw new Error(connectionError.message);
        }

        details.connectionTest = connectionData;
        
        if (!connectionData.success) {
          overallSuccess = false;
          recommendations.push('Verifique as credenciais da API do WhatsApp');
          recommendations.push('Confirme se o token e phone_number_id estão corretos');
        }

      } catch (error) {
        details.connectionError = error;
        // Não marcar como falha se for apenas por Edge Function indisponível
      }

      // Teste 3: Verificar configuração do Supabase
      try {
        const { data: user } = await supabase.auth.getUser();
        details.supabaseAuth = { connected: !!user.user };
        
        if (!user.user) {
          recommendations.push('Verifique a conexão com o Supabase');
        }
        
      } catch (error) {
        overallSuccess = false;
        details.supabaseError = error;
        recommendations.push('Verifique a configuração do Supabase');
      }

      const result: DiagnosticResult = {
        success: overallSuccess,
        message: overallSuccess 
          ? 'Diagnóstico concluído com sucesso!' 
          : 'Problemas identificados no diagnóstico',
        details,
        environment,
        recommendations: recommendations.length > 0 ? recommendations : undefined
      };

      return result;

    } catch (error: any) {
      return {
        success: false,
        message: `Erro no diagnóstico: ${error.message}`,
        details: { error: error.message }
      };
    } finally {
      setIsRunning(false);
    }
  };

  const testWhatsAppCredentials = async (credentials: {
    token: string;
    phoneId: string;
  }): Promise<DiagnosticResult> => {
    try {
      // Este é um teste mais direto que pode ser expandido no futuro
      if (!credentials.token || !credentials.phoneId) {
        return {
          success: false,
          message: 'Token e Phone ID são obrigatórios',
          recommendations: ['Forneça as credenciais válidas do WhatsApp']
        };
      }

      if (credentials.token.length < 50) {
        return {
          success: false,
          message: 'Token parece ser muito curto',
          recommendations: ['Verifique se o token está completo']
        };
      }

      if (!/^\d+$/.test(credentials.phoneId)) {
        return {
          success: false,
          message: 'Phone ID deve conter apenas números',
          recommendations: ['Verifique o formato do Phone Number ID']
        };
      }

      return {
        success: true,
        message: 'Credenciais parecem válidas (teste básico)',
        details: { 
          tokenLength: credentials.token.length,
          phoneIdLength: credentials.phoneId.length 
        }
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Erro na validação: ${error.message}`,
        details: { error: error.message }
      };
    }
  };

  return {
    runFullDiagnostic,
    testWhatsAppCredentials,
    isRunning
  };
};
