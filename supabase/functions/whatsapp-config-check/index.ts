
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-security-level",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ConfigCheckRequest {
  action: 'check_config' | 'test_connection';
}

const validateTokenFormat = (token: string): boolean => {
  return token && token.length > 50 && token.startsWith('EAAR');
};

const handler = async (req: Request): Promise<Response> => {
  console.log(`🔧 [WHATSAPP-CONFIG-CHECK] ${req.method} request received - v5.0 single-token`);
  
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
    console.log(`🔧 [WHATSAPP-CONFIG-CHECK] Ação: ${action}`);

    // Carregar variáveis de ambiente
    const whatsappToken = Deno.env.get("WHATSAPP_API_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const businessId = Deno.env.get("WHATSAPP_BUSINESS_ID");
    const webhookToken = Deno.env.get("WHATSAPP_WEBHOOK_TOKEN");

    if (action === 'check_config') {
      console.log(`🔧 [CONFIG-CHECK] Verificando configuração...`);
      
      const hasToken = !!whatsappToken;
      const hasPhoneId = !!phoneNumberId;
      const hasBusinessId = !!businessId;
      const hasWebhookToken = !!webhookToken;
      const isValidToken = hasToken ? validateTokenFormat(whatsappToken) : false;

      console.log(`🔧 [CONFIG-CHECK] Token: ${hasToken ? 'OK' : 'FALTANDO'}`);
      console.log(`🔧 [CONFIG-CHECK] Phone ID: ${hasPhoneId ? 'OK' : 'FALTANDO'}`);
      console.log(`🔧 [CONFIG-CHECK] Business ID: ${hasBusinessId ? 'OK' : 'FALTANDO'}`);
      console.log(`🔧 [CONFIG-CHECK] Webhook Token: ${hasWebhookToken ? 'OK' : 'FALTANDO'}`);
      console.log(`🔧 [CONFIG-CHECK] Token: ${isValidToken ? 'VÁLIDO' : 'INVÁLIDO'}`);

      const result = {
        hasToken,
        hasPhoneId,
        hasBusinessId,
        hasWebhookToken,
        isValid: isValidToken,
        details: {
          tokenLength: whatsappToken?.length || 0,
          phoneIdLength: phoneNumberId?.length || 0,
          businessIdLength: businessId?.length || 0,
          webhookTokenLength: webhookToken?.length || 0
        }
      };

      console.log(`✅ [WHATSAPP-CONFIG-CHECK] Resultado:`, JSON.stringify(result, null, 2));

      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (action === 'test_connection') {
      console.log(`🔧 [CONNECTION-TEST] Iniciando teste de conexão...`);
      
      if (!whatsappToken) {
        throw new Error("WHATSAPP_API_TOKEN não configurado");
      }

      if (!phoneNumberId) {
        throw new Error("WHATSAPP_PHONE_NUMBER_ID não configurado");
      }

      const testUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}?fields=display_phone_number,verified_name`;
      console.log(`🔧 [CONNECTION-TEST] Testando URL: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log(`📱 [CONNECTION-TEST] Status: ${response.status}`);

      const responseText = await response.text();
      console.log(`📱 [CONNECTION-TEST] Resposta: ${responseText}`);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { error: { message: responseText } };
        }
        
        console.error(`❌ [CONNECTION-TEST] Falha: ${errorData.error?.message || responseText}`);
        
        return new Response(
          JSON.stringify({
            success: false,
            message: errorData.error?.message || "Erro na conexão",
            details: {
              status: response.status,
              response: errorData,
              url: testUrl
            }
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Resposta inválida da API do WhatsApp');
      }

      console.log(`✅ [CONNECTION-TEST] Sucesso!`);
      console.log(`📱 [CONNECTION-TEST] Número: ${responseData.display_phone_number}`);
      console.log(`📱 [CONNECTION-TEST] Nome: ${responseData.verified_name}`);

      const result = {
        success: true,
        tokenType: "main",
        message: "Conexão com WhatsApp API bem-sucedida",
        details: {
          phoneNumber: responseData.display_phone_number,
          verifiedName: responseData.verified_name,
          phoneId: responseData.id,
          apiVersion: "v18.0",
          tokenInfo: `token (${whatsappToken.substring(0, 8)}...${whatsappToken.slice(-8)})`
        }
      };

      console.log(`✅ [WHATSAPP-CONFIG-CHECK] Resultado:`, JSON.stringify(result, null, 2));

      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação não reconhecida" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor",
        message: "Falha na verificação da configuração WhatsApp"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("🔧 [WHATSAPP-CONFIG-CHECK] Edge Function carregada e pronta! v5.0 single-token");
serve(handler);
