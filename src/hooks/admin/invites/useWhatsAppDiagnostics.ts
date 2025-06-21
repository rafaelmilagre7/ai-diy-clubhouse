
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
  environment?: string;
  recommendations?: string[];
  errors?: string[];
}

export const useWhatsAppDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);

  const runFullDiagnostic = async (): Promise<DiagnosticResult> => {
    setIsRunning(true);
    
    try {
      console.log('🔧 [Diagnóstico] Iniciando diagnóstico completo...');
      
      // Detectar ambiente
      const hostname = window.location.hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
      const environment = isLocal ? 'local' : 'production';
      
      console.log(`🔧 [Diagnóstico] Ambiente detectado: ${environment}`);
      
      const errors: string[] = [];
      let overallSuccess = true;
      const details: any = { environment };

      // Teste 1: Verificar se Edge Functions estão disponíveis e configuração
      console.log('🔧 [Diagnóstico] Testando Edge Function whatsapp-config-check...');
      
      try {
        const { data: configData, error: configError } = await supabase.functions.invoke('whatsapp-config-check', {
          body: { action: 'check_config' }
        });

        if (configError) {
          console.error('❌ [Diagnóstico] Erro na Edge Function config:', configError);
          throw new Error(`Edge Function Error: ${configError.message}`);
        }

        console.log('✅ [Diagnóstico] Edge Function respondeu:', configData);
        details.configCheck = configData;
        
        if (!configData.isValid) {
          overallSuccess = false;
          errors.push('Configuração WhatsApp incompleta - verifique as variáveis de ambiente');
        }

      } catch (error: any) {
        console.error('❌ [Diagnóstico] Falha na Edge Function:', error);
        overallSuccess = false;
        details.configError = {
          message: error.message,
          name: error.name
        };
        
        if (environment === 'production') {
          errors.push('Edge Functions não estão respondendo no ambiente de produção');
          errors.push('Verifique se as funções foram deployadas corretamente');
        } else {
          errors.push('Edge Functions não estão disponíveis no ambiente local');
          errors.push('Execute: supabase start');
        }
      }

      // Teste 2: Verificar conectividade com WhatsApp API (se configuração OK)
      if (details.configCheck?.isValid) {
        console.log('🔧 [Diagnóstico] Testando conexão com WhatsApp API...');
        
        try {
          const { data: connectionData, error: connectionError } = await supabase.functions.invoke('whatsapp-config-check', {
            body: { action: 'test_connection' }
          });

          if (connectionError) {
            throw new Error(`Connection Test Error: ${connectionError.message}`);
          }

          console.log('✅ [Diagnóstico] Teste de conexão:', connectionData);
          details.connectionTest = connectionData;
          
          if (!connectionData.success) {
            overallSuccess = false;
            errors.push(`Falha na conexão com WhatsApp API: ${connectionData.message}`);
          }

        } catch (error: any) {
          console.error('❌ [Diagnóstico] Erro no teste de conexão:', error);
          details.connectionError = {
            message: error.message,
            name: error.name
          };
          errors.push('Falha no teste de conexão com WhatsApp API');
        }
      }

      // Teste 3: Verificar configuração do Supabase
      console.log('🔧 [Diagnóstico] Verificando conexão com Supabase...');
      
      try {
        const { data: user, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw new Error(`Supabase Auth Error: ${userError.message}`);
        }
        
        details.supabaseAuth = { 
          connected: !!user.user,
          userId: user.user?.id?.substring(0, 8) + '***'
        };
        
        if (!user.user) {
          errors.push('Usuário não está autenticado no Supabase');
        } else {
          console.log('✅ [Diagnóstico] Supabase conectado:', user.user.id.substring(0, 8) + '***');
        }
        
      } catch (error: any) {
        console.error('❌ [Diagnóstico] Erro no Supabase:', error);
        overallSuccess = false;
        details.supabaseError = {
          message: error.message,
          name: error.name
        };
        errors.push('Falha na conexão com Supabase');
      }

      // Gerar recomendações baseadas nos erros
      const recommendations: string[] = [];
      
      if (errors.some(e => e.includes('Edge Functions'))) {
        if (environment === 'local') {
          recommendations.push('Execute: supabase start');
          recommendations.push('Verifique se todas as Edge Functions estão deployadas localmente');
        } else {
          recommendations.push('Verifique o status das Edge Functions no dashboard do Supabase');
          recommendations.push('Confirme se as funções foram deployadas na produção');
        }
      }
      
      if (errors.some(e => e.includes('variáveis de ambiente'))) {
        recommendations.push('Configure WHATSAPP_API_TOKEN no Supabase');
        recommendations.push('Configure WHATSAPP_PHONE_NUMBER_ID no Supabase');
        recommendations.push('Configure WHATSAPP_BUSINESS_ID no Supabase');
        recommendations.push('Configure WHATSAPP_WEBHOOK_TOKEN no Supabase');
      }
      
      if (errors.some(e => e.includes('WhatsApp API'))) {
        recommendations.push('Verifique se o token do WhatsApp é válido');
        recommendations.push('Confirme se o Phone Number ID está correto');
        recommendations.push('Verifique as permissões da aplicação no Meta Developers');
      }

      const result: DiagnosticResult = {
        success: overallSuccess,
        message: overallSuccess 
          ? 'Diagnóstico concluído - sistema funcionando corretamente' 
          : `Diagnóstico identificou ${errors.length} problema(s)`,
        details,
        environment,
        errors: errors.length > 0 ? errors : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined
      };

      console.log('🔧 [Diagnóstico] Resultado final:', result);
      return result;

    } catch (error: any) {
      console.error('❌ [Diagnóstico] Erro crítico:', error);
      
      return {
        success: false,
        message: `Erro crítico no diagnóstico: ${error.message}`,
        details: { 
          criticalError: {
            message: error.message,
            name: error.name,
            stack: error.stack?.split('\n').slice(0, 5)
          }
        },
        errors: [`Erro crítico: ${error.message}`]
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
      console.log('🔧 [Teste Credenciais] Validando credenciais WhatsApp...');
      
      // Validação básica
      if (!credentials.token || !credentials.phoneId) {
        return {
          success: false,
          message: 'Token e Phone ID são obrigatórios',
          errors: ['Forneça as credenciais válidas do WhatsApp']
        };
      }

      if (credentials.token.length < 50) {
        return {
          success: false,
          message: 'Token parece ser muito curto',
          errors: ['Verifique se o token está completo']
        };
      }

      if (!/^\d+$/.test(credentials.phoneId)) {
        return {
          success: false,
          message: 'Phone ID deve conter apenas números',
          errors: ['Verifique o formato do Phone Number ID']
        };
      }

      console.log('✅ [Teste Credenciais] Credenciais válidas no formato básico');

      return {
        success: true,
        message: 'Credenciais parecem válidas (teste básico)',
        details: { 
          tokenLength: credentials.token.length,
          phoneIdLength: credentials.phoneId.length 
        }
      };

    } catch (error: any) {
      console.error('❌ [Teste Credenciais] Erro:', error);
      
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
