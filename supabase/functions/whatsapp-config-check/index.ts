
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-security-level",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ConfigCheckRequest {
  action: 'check_config' | 'test_connection' | 'test_token_1' | 'test_token_2' | 'compare_tokens';
}

const checkConfiguration = () => {
  console.log('🔧 [CONFIG-CHECK] Verificando configuração...');
  
  const token1 = Deno.env.get("WHATSAPP_API_TOKEN");
  const token2 = Deno.env.get("WHATSAPP_API_TOKEN_2");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const businessId = Deno.env.get("WHATSAPP_BUSINESS_ID");
  const webhookToken = Deno.env.get("WHATSAPP_WEBHOOK_TOKEN");

  const hasToken1 = !!token1 && token1.length > 10;
  const hasToken2 = !!token2 && token2.length > 10;
  const hasPhoneId = !!phoneId && phoneId.length > 5;
  const hasBusinessId = !!businessId && businessId.length > 5;
  const hasWebhookToken = !!webhookToken && webhookToken.length > 5;

  console.log(`🔧 [CONFIG-CHECK] Token 1: ${hasToken1 ? 'OK' : 'MISSING'}`);
  console.log(`🔧 [CONFIG-CHECK] Token 2: ${hasToken2 ? 'OK' : 'MISSING'}`);
  console.log(`🔧 [CONFIG-CHECK] Phone ID: ${hasPhoneId ? 'OK' : 'MISSING'}`);
  console.log(`🔧 [CONFIG-CHECK] Business ID: ${hasBusinessId ? 'OK' : 'MISSING'}`);
  console.log(`🔧 [CONFIG-CHECK] Webhook Token: ${hasWebhookToken ? 'OK' : 'MISSING'}`);

  const result = {
    hasToken1,
    hasToken2,
    hasPhoneId,
    hasBusinessId,
    hasWebhookToken,
    isValid: hasToken1 && hasPhoneId && hasBusinessId && hasWebhookToken,
    isValidToken2: hasToken2 && hasPhoneId && hasBusinessId && hasWebhookToken,
    details: {
      token1Length: token1 ? token1.length : 0,
      token2Length: token2 ? token2.length : 0,
      phoneIdLength: phoneId ? phoneId.length : 0,
      businessIdLength: businessId ? businessId.length : 0,
      webhookTokenLength: webhookToken ? webhookToken.length : 0
    }
  };

  console.log(`🔧 [CONFIG-CHECK] Token 1: ${result.isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
  console.log(`🔧 [CONFIG-CHECK] Token 2: ${result.isValidToken2 ? 'VÁLIDO' : 'INVÁLIDO'}`);
  return result;
};

const testConnectionWithToken = async (tokenType: 'token1' | 'token2') => {
  console.log(`🔧 [CONNECTION-TEST-${tokenType.toUpperCase()}] Iniciando teste de conexão...`);
  
  const token = tokenType === 'token1' 
    ? Deno.env.get("WHATSAPP_API_TOKEN")
    : Deno.env.get("WHATSAPP_API_TOKEN_2");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

  if (!token || !phoneId) {
    console.log(`❌ [CONNECTION-TEST-${tokenType.toUpperCase()}] Credenciais não configuradas`);
    return {
      success: false,
      tokenType,
      message: `Credenciais WhatsApp não configuradas para ${tokenType}`,
      details: { 
        missingToken: !token, 
        missingPhoneId: !phoneId 
      }
    };
  }

  try {
    const apiUrl = `https://graph.facebook.com/v18.0/${phoneId}?fields=display_phone_number,verified_name`;
    
    console.log(`🔧 [CONNECTION-TEST-${tokenType.toUpperCase()}] Testando URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const responseText = await response.text();
    console.log(`📱 [CONNECTION-TEST-${tokenType.toUpperCase()}] Status: ${response.status}`);
    console.log(`📱 [CONNECTION-TEST-${tokenType.toUpperCase()}] Resposta: ${responseText}`);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.log(`⚠️ [CONNECTION-TEST-${tokenType.toUpperCase()}] Resposta não é JSON válido`);
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      let errorMessage = 'Erro desconhecido na API do WhatsApp';
      
      if (responseData.error) {
        errorMessage = responseData.error.message || responseData.error.error_user_msg || 'Erro da API do WhatsApp';
        
        if (errorMessage.includes('Invalid access token')) {
          errorMessage = `Token de acesso inválido para ${tokenType}. Verifique o WHATSAPP_API_TOKEN${tokenType === 'token2' ? '_2' : ''}`;
        } else if (errorMessage.includes('Unsupported request')) {
          errorMessage = 'ID do número de telefone inválido. Verifique o WHATSAPP_PHONE_NUMBER_ID';
        } else if (errorMessage.includes('Application does not have the permission')) {
          errorMessage = 'App não tem permissões necessárias. Verifique as permissões no Meta Developers';
        }
      }

      console.log(`❌ [CONNECTION-TEST-${tokenType.toUpperCase()}] Falha: ${errorMessage}`);

      return {
        success: false,
        tokenType,
        message: errorMessage,
        details: {
          status: response.status,
          response: responseData,
          url: apiUrl.replace(token, 'TOKEN_HIDDEN')
        }
      };
    }

    console.log(`✅ [CONNECTION-TEST-${tokenType.toUpperCase()}] Sucesso!`);
    console.log(`📱 [CONNECTION-TEST-${tokenType.toUpperCase()}] Número: ${responseData.display_phone_number || 'N/A'}`);
    console.log(`📱 [CONNECTION-TEST-${tokenType.toUpperCase()}] Nome: ${responseData.verified_name || 'N/A'}`);

    return {
      success: true,
      tokenType,
      message: `Conexão com WhatsApp API bem-sucedida usando ${tokenType}`,
      details: {
        phoneNumber: responseData.display_phone_number,
        verifiedName: responseData.verified_name,
        phoneId: phoneId,
        apiVersion: 'v18.0',
        tokenInfo: `${tokenType} (${token.substring(0, 8)}...${token.substring(token.length - 8)})`
      }
    };

  } catch (error: any) {
    console.error(`❌ [CONNECTION-TEST-${tokenType.toUpperCase()}] Erro de rede:`, error);
    
    return {
      success: false,
      tokenType,
      message: `Erro de conexão com ${tokenType}: ${error.message}`,
      details: {
        errorType: error.name,
        errorMessage: error.message
      }
    };
  }
};

const compareTokens = async () => {
  console.log('🔍 [COMPARE-TOKENS] Iniciando comparação de tokens...');
  
  const [token1Result, token2Result] = await Promise.all([
    testConnectionWithToken('token1'),
    testConnectionWithToken('token2')
  ]);

  const comparison = {
    token1: token1Result,
    token2: token2Result,
    recommendation: token1Result.success && token2Result.success 
      ? 'Ambos os tokens estão funcionando! Você pode usar qualquer um.'
      : token1Result.success 
        ? 'Recomendamos usar o Token 1 (WHATSAPP_API_TOKEN)'
        : token2Result.success 
          ? 'Recomendamos usar o Token 2 (WHATSAPP_API_TOKEN_2)'
          : 'Nenhum token está funcionando. Verifique as configurações.',
    summary: {
      token1Status: token1Result.success ? 'working' : 'failed',
      token2Status: token2Result.success ? 'working' : 'failed',
      bothWorking: token1Result.success && token2Result.success,
      noneWorking: !token1Result.success && !token2Result.success
    }
  };

  console.log('🔍 [COMPARE-TOKENS] Comparação finalizada:', comparison.recommendation);
  return comparison;
};

const handler = async (req: Request): Promise<Response> => {
  console.log(`🔧 [WHATSAPP-CONFIG-CHECK] ${req.method} request received - v4.0 dual-token support`);
  
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
        result = await testConnectionWithToken('token1');
        break;

      case 'test_token_1':
        result = await testConnectionWithToken('token1');
        break;

      case 'test_token_2':
        result = await testConnectionWithToken('token2');
        break;

      case 'compare_tokens':
        result = await compareTokens();
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

console.log("🔧 [WHATSAPP-CONFIG-CHECK] Edge Function carregada e pronta! v4.0 dual-token support");
serve(handler);
