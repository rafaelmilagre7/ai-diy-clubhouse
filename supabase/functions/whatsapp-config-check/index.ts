
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
  const token = Deno.env.get("WHATSAPP_API_TOKEN");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const businessId = Deno.env.get("WHATSAPP_BUSINESS_ID");
  const webhookToken = Deno.env.get("WHATSAPP_WEBHOOK_TOKEN");

  const hasToken = !!token && token.length > 10;
  const hasPhoneId = !!phoneId && phoneId.length > 5;
  const hasBusinessId = !!businessId && businessId.length > 5;
  const hasWebhookToken = !!webhookToken && webhookToken.length > 5;

  return {
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
};

const testConnection = async () => {
  const token = Deno.env.get("WHATSAPP_API_TOKEN");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

  if (!token || !phoneId) {
    return {
      success: false,
      message: "Credenciais não configuradas",
      details: { missingToken: !token, missingPhoneId: !phoneId }
    };
  }

  try {
    // Teste simples: verificar se conseguimos acessar informações do número de telefone
    const apiUrl = `https://graph.facebook.com/v18.0/${phoneId}?fields=display_phone_number,verified_name`;
    
    console.log(`🔧 Testando conexão com: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const responseText = await response.text();
    console.log(`📱 Resposta da API (${response.status}):`, responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      let errorMessage = 'Erro desconhecido na API';
      
      if (responseData.error) {
        errorMessage = responseData.error.message || responseData.error.error_user_msg || 'Erro da API do WhatsApp';
        
        // Mapear erros comuns
        if (errorMessage.includes('Invalid access token')) {
          errorMessage = 'Token de acesso inválido. Verifique o WHATSAPP_API_TOKEN';
        } else if (errorMessage.includes('Unsupported request')) {
          errorMessage = 'ID do número de telefone inválido. Verifique o WHATSAPP_PHONE_NUMBER_ID';
        } else if (errorMessage.includes('Application does not have the permission')) {
          errorMessage = 'App não tem permissões necessárias. Verifique as permissões no Meta Developers';
        }
      }

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
    console.error(`❌ Erro na conexão:`, error);
    
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
  console.log(`🔧 [WHATSAPP-CONFIG-CHECK] Nova requisição: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }), 
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { action }: ConfigCheckRequest = await req.json();
    
    console.log(`🔧 Ação solicitada: ${action}`);

    let result;

    switch (action) {
      case 'check_config':
        result = checkConfiguration();
        console.log(`✅ Verificação de configuração:`, result);
        break;
        
      case 'test_connection':
        result = await testConnection();
        console.log(`✅ Teste de conexão:`, result);
        break;
        
      default:
        throw new Error(`Ação não suportada: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Erro interno do servidor",
        details: error.stack ? error.stack.split('\n').slice(0, 3) : undefined
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("🔧 [WHATSAPP-CONFIG-CHECK] Edge Function carregada com testes completos!");
serve(handler);
