import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-security-level",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface WhatsAppTestRequest {
  testNumber?: string;
}

const formatWhatsAppNumber = (number: string): string => {
  const cleanNumber = number.replace(/\D/g, '');
  if (!cleanNumber.startsWith('55') && cleanNumber.length <= 11) {
    return `55${cleanNumber}`;
  }
  return cleanNumber;
};

const handler = async (req: Request): Promise<Response> => {
  console.log(`🧪 [WHATSAPP-TEST] Nova requisição: ${req.method} - v3.0 CORS fixed`);
  
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
    const { testNumber = "5511999999999" }: WhatsAppTestRequest = await req.json();
    
    console.log(`🧪 [WHATSAPP-TEST] Testando conectividade WhatsApp...`);

    // Verificar configurações
    const whatsappToken = Deno.env.get("WHATSAPP_API_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    
    if (!whatsappToken) {
      throw new Error("WHATSAPP_API_TOKEN não configurado");
    }

    if (!phoneNumberId) {
      throw new Error("WHATSAPP_PHONE_NUMBER_ID não configurado");
    }

    // Formatar número de teste
    const formattedNumber = formatWhatsAppNumber(testNumber);
    console.log(`🧪 [WHATSAPP-TEST] Número formatado: ${formattedNumber}`);

    // Testar conectividade com API do WhatsApp
    const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}`;
    console.log(`🧪 [WHATSAPP-TEST] Testando URL: ${apiUrl}`);
    
    const testResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      }
    });

    const responseText = await testResponse.text();
    console.log(`🧪 [WHATSAPP-TEST] Resposta da API:`, responseText);

    if (!testResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { error: { message: responseText } };
      }
      
      console.error(`❌ [WHATSAPP-TEST] Erro da API (${testResponse.status}):`, errorData);
      
      let errorMessage = errorData.error?.message || 'Erro desconhecido da API do WhatsApp';
      
      if (errorMessage.includes('Invalid access token')) {
        errorMessage = 'Token de acesso do WhatsApp inválido ou expirado';
      } else if (errorMessage.includes('Unsupported request')) {
        errorMessage = 'Configuração da API do WhatsApp inválida';
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: {
            status: testResponse.status,
            apiResponse: errorData
          },
          config: {
            hasToken: !!whatsappToken,
            hasPhoneId: !!phoneNumberId,
            phoneNumberId: phoneNumberId ? phoneNumberId.substring(0, 8) + '***' : null
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
      console.error(`❌ [WHATSAPP-TEST] Erro ao parsear resposta:`, e);
      throw new Error('Resposta inválida da API do WhatsApp');
    }

    console.log(`✅ [WHATSAPP-TEST] Conectividade confirmada!`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Conectividade WhatsApp confirmada com sucesso",
        config: {
          hasToken: !!whatsappToken,
          hasPhoneId: !!phoneNumberId,
          phoneNumberId: phoneNumberId ? phoneNumberId.substring(0, 8) + '***' : null
        },
        apiInfo: {
          name: responseData.name || 'N/A',
          status: responseData.status || 'N/A',
          id: responseData.id || 'N/A'
        },
        testDetails: {
          formattedTestNumber: formattedNumber,
          apiUrl: apiUrl
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [WHATSAPP-TEST] Erro:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor",
        message: "Falha no teste de conectividade WhatsApp"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("🧪 [WHATSAPP-TEST] Edge Function carregada! v3.0 CORS fixed");
serve(handler);
