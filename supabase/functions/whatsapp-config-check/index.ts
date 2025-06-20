
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface WhatsAppConfigStatus {
  configured: boolean;
  hasApiToken: boolean;
  hasPhoneNumberId: boolean;
  hasBusinessId: boolean;
  phoneNumberId?: string;
  businessId?: string;
  webhookConfigured: boolean;
  testConnectionStatus: 'success' | 'failed' | 'not_tested';
  lastTestAt?: string;
  errors: string[];
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`🔍 [WHATSAPP-CONFIG-CHECK] Nova requisição: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const status: WhatsAppConfigStatus = {
      configured: false,
      hasApiToken: false,
      hasPhoneNumberId: false,
      hasBusinessId: false,
      webhookConfigured: false,
      testConnectionStatus: 'not_tested',
      errors: []
    };

    // Verificar variáveis de ambiente
    const apiToken = Deno.env.get("WHATSAPP_API_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const businessId = Deno.env.get("WHATSAPP_BUSINESS_ID");
    const webhookToken = Deno.env.get("WHATSAPP_WEBHOOK_TOKEN");

    status.hasApiToken = !!apiToken;
    status.hasPhoneNumberId = !!phoneNumberId;
    status.hasBusinessId = !!businessId;
    status.webhookConfigured = !!webhookToken;

    if (phoneNumberId) {
      status.phoneNumberId = phoneNumberId;
    }
    if (businessId) {
      status.businessId = businessId;
    }

    // Validar configurações
    if (!apiToken) {
      status.errors.push("WHATSAPP_API_TOKEN não configurado");
    }
    if (!phoneNumberId) {
      status.errors.push("WHATSAPP_PHONE_NUMBER_ID não configurado");
    }
    if (!businessId) {
      status.errors.push("WHATSAPP_BUSINESS_ID não configurado");
    }
    if (!webhookToken) {
      status.errors.push("WHATSAPP_WEBHOOK_TOKEN não configurado");
    }

    // Se tudo estiver configurado, testar conexão
    if (apiToken && phoneNumberId && req.method === "POST") {
      try {
        console.log(`🧪 [WHATSAPP-CONFIG-CHECK] Testando conexão...`);
        
        const testResponse = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          }
        });

        if (testResponse.ok) {
          const data = await testResponse.json();
          status.testConnectionStatus = 'success';
          status.lastTestAt = new Date().toISOString();
          console.log(`✅ [WHATSAPP-CONFIG-CHECK] Conexão bem-sucedida:`, data);
        } else {
          const errorData = await testResponse.json();
          status.testConnectionStatus = 'failed';
          status.errors.push(`Erro na API: ${errorData.error?.message || 'Erro desconhecido'}`);
          console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro na API:`, errorData);
        }
      } catch (testError: any) {
        status.testConnectionStatus = 'failed';
        status.errors.push(`Erro de conexão: ${testError.message}`);
        console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro de teste:`, testError);
      }
    }

    // Determinar se está configurado
    status.configured = status.hasApiToken && status.hasPhoneNumberId && status.hasBusinessId;

    console.log(`📊 [WHATSAPP-CONFIG-CHECK] Status:`, {
      configured: status.configured,
      errorsCount: status.errors.length,
      testStatus: status.testConnectionStatus
    });

    return new Response(
      JSON.stringify({
        success: true,
        status,
        timestamp: new Date().toISOString()
      }),
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
        error: error.message || "Erro interno do servidor",
        status: {
          configured: false,
          hasApiToken: false,
          hasPhoneNumberId: false,
          hasBusinessId: false,
          webhookConfigured: false,
          testConnectionStatus: 'failed',
          errors: [error.message || "Erro interno"]
        }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("🔍 [WHATSAPP-CONFIG-CHECK] Edge Function carregada!");
serve(handler);
