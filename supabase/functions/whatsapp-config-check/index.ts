
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ConfigCheckRequest {
  action: 'check_config' | 'test_connection';
}

const checkConfiguration = () => {
  console.log('🔧 [CONFIG-CHECK] Verificando configuração...');
  
  const token = Deno.env.get("WHATSAPP_API_TOKEN");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const businessId = Deno.env.get("WHATSAPP_BUSINESS_ID");
  const webhookToken = Deno.env.get("WHATSAPP_WEBHOOK_TOKEN");

  const hasToken = !!token && token.length > 10;
  const hasPhoneId = !!phoneId && phoneId.length > 5;
  const hasBusinessId = !!businessId && businessId.length > 5;
  const hasWebhookToken = !!webhookToken && webhookToken.length > 5;

  console.log(`🔧 [CONFIG-CHECK] Token: ${hasToken ? 'OK' : 'MISSING'}`);
  console.log(`🔧 [CONFIG-CHECK] Phone ID: ${hasPhoneId ? 'OK' : 'MISSING'}`);
  console.log(`🔧 [CONFIG-CHECK] Business ID: ${hasBusinessId ? 'OK' : 'MISSING'}`);
  console.log(`🔧 [CONFIG-CHECK] Webhook Token: ${hasWebhookToken ? 'OK' : 'MISSING'}`);

  const result = {
    hasToken,
    hasPhoneId,
    hasBusinessId,
    hasWebhookToken,
    isValid: hasToken && hasPhoneId && hasBusinessId && hasWebhookToken,
    details: {
      tokenLength: token ? token.length : 0,
      phoneIdLength: phoneId ? phoneId.length : 0,
      businessIdLength: businessId ? businessId.length : 0,
      webhookTokenLength: webhookToken ? webhookToken.length : 0
    }
  };

  console.log(`🔧 [CONFIG-CHECK] Resultado: ${result.isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
  return result;
};

const testConnection = async () => {
  console.log('🔧 [CONNECTION-TEST] Iniciando teste de conexão...');
  
  const token = Deno.env.get("WHATSAPP_API_TOKEN");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

  if (!token || !phoneId) {
    console.log('❌ [CONNECTION-TEST] Credenciais não configuradas');
    return {
      success: false,
      message: "Credenciais WhatsApp não configuradas",
      details: { 
        missingToken: !token, 
        missingPhoneId: !phoneId 
      }
    };
  }

  try {
    // Teste: verificar informações do número de telefone
    const apiUrl = `https://graph.facebook.com/v18.0/${phoneId}?fields=display_phone_number,verified_name`;
    
    console.log(`🔧 [CONNECTION-TEST] Testando URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const responseText = await response.text();
    console.log(`📱 [CONNECTION-TEST] Status: ${response.status}`);
    console.log(`📱 [CONNECTION-TEST] Resposta: ${responseText}`);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.log('⚠️ [CONNECTION-TEST] Resposta não é JSON válido');
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      let errorMessage = 'Erro desconhecido na API do WhatsApp';
      
      if (responseData.error) {
        errorMessage = responseData.error.message || responseData.error.error_user_msg || 'Erro da API do WhatsApp';
        
        // Mapear erros comuns para mensagens mais claras
        if (errorMessage.includes('Invalid access token')) {
          errorMessage = 'Token de acesso inválido. Verifique o WHATSAPP_API_TOKEN';
        } else if (errorMessage.includes('Unsupported request')) {
          errorMessage = 'ID do número de telefone inválido. Verifique o WHATSAPP_PHONE_NUMBER_ID';
        } else if (errorMessage.includes('Application does not have the permission')) {
          errorMessage = 'App não tem permissões necessárias. Verifique as permissões no Meta Developers';
        }
      }

      console.log(`❌ [CONNECTION-TEST] Falha: ${errorMessage}`);

      return {
        success: false,
        message: errorMessage,
        details: {
          status: response.status,
          response: responseData,
          url: apiUrl.replace(token, 'TOKEN_HIDDEN')
        }
      };
    }

    console.log(`✅ [CONNECTION-TEST] Sucesso!`);
    console.log(`📱 [CONNECTION-TEST] Número: ${responseData.display_phone_number || 'N/A'}`);
    console.log(`📱 [CONNECTION-TEST] Nome: ${responseData.verified_name || 'N/A'}`);

    return {
      success: true,
      message: "Conexão com WhatsApp API bem-sucedida",
      details: {
        phoneNumber: responseData.display_phone_number,
        verifiedName: responseData.verified_name,
        phoneId: phoneId,
        apiVersion: 'v18.0'
      }
    };

  } catch (error: any) {
    console.error(`❌ [CONNECTION-TEST] Erro de rede:`, error);
    
    return {
      success: false,
      message: `Erro de conexão: ${error.message}`,
      details: {
        errorType: error.name,
        errorMessage: error.message
      }
    };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log(`🔧 [WHATSAPP-CONFIG-CHECK] ${req.method} request received`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log(`❌ [WHATSAPP-CONFIG-CHECK] Método não permitido: ${req.method}`);
    return new Response(
      JSON.stringify({ error: "Método não permitido" }), 
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { action }: ConfigCheckRequest = await req.json();
    
    console.log(`🔧 [WHATSAPP-CONFIG-CHECK] Ação: ${action}`);

    let result;

    switch (action) {
      case 'check_config':
        result = checkConfiguration();
        break;
        
      case 'test_connection':
        result = await testConnection();
        break;
        
      default:
        throw new Error(`Ação não suportada: ${action}`);
    }

    console.log(`✅ [WHATSAPP-CONFIG-CHECK] Resultado:`, result);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro crítico:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Erro interno do servidor",
        details: {
          errorType: error.name,
          errorMessage: error.message,
          stack: error.stack ? error.stack.split('\n').slice(0, 3) : undefined
        }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("🔧 [WHATSAPP-CONFIG-CHECK] Edge Function carregada e pronta!");
serve(handler);
