
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
  templates?: any[];
  businessAccounts?: any[];
}

interface TestMessageRequest {
  action: 'test_message';
  phoneNumber: string;
  message?: string;
}

interface TestConnectionRequest {
  action: 'test_connection';
}

interface ListTemplatesRequest {
  action: 'list_templates';
}

interface ListBusinessAccountsRequest {
  action: 'list_business_accounts';
}

type RequestBody = TestMessageRequest | TestConnectionRequest | ListTemplatesRequest | ListBusinessAccountsRequest;

const handler = async (req: Request): Promise<Response> => {
  console.log(`🔍 [WHATSAPP-CONFIG-CHECK] Nova requisição: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar variáveis de ambiente
    const apiToken = Deno.env.get("WHATSAPP_API_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const businessId = Deno.env.get("WHATSAPP_BUSINESS_ID");
    const webhookToken = Deno.env.get("WHATSAPP_WEBHOOK_TOKEN");

    const status: WhatsAppConfigStatus = {
      configured: false,
      hasApiToken: !!apiToken,
      hasPhoneNumberId: !!phoneNumberId,
      hasBusinessId: !!businessId,
      webhookConfigured: !!webhookToken,
      testConnectionStatus: 'not_tested',
      errors: []
    };

    if (phoneNumberId) status.phoneNumberId = phoneNumberId;
    if (businessId) status.businessId = businessId;

    // Validar configurações básicas
    if (!apiToken) status.errors.push("WHATSAPP_API_TOKEN não configurado");
    if (!phoneNumberId) status.errors.push("WHATSAPP_PHONE_NUMBER_ID não configurado");
    if (!businessId) status.errors.push("WHATSAPP_BUSINESS_ID não configurado");
    if (!webhookToken) status.errors.push("WHATSAPP_WEBHOOK_TOKEN não configurado");

    // Processar ações POST
    if (req.method === "POST") {
      try {
        const body: RequestBody = await req.json();
        console.log(`🎯 [WHATSAPP-CONFIG-CHECK] Ação solicitada: ${body.action}`);

        switch (body.action) {
          case 'test_connection':
            return await handleTestConnection(apiToken, phoneNumberId, status);
          
          case 'list_templates':
            return await handleListTemplates(apiToken, businessId, status);
          
          case 'list_business_accounts':
            return await handleListBusinessAccounts(apiToken, status);
          
          case 'test_message':
            return await handleTestMessage(apiToken, phoneNumberId, body, status);
          
          default:
            throw new Error(`Ação não reconhecida: ${(body as any).action}`);
        }
      } catch (parseError: any) {
        console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro ao parsear body:`, parseError);
        status.errors.push(`Erro ao processar requisição: ${parseError.message}`);
      }
    }

    // GET request - retornar status básico
    status.configured = status.hasApiToken && status.hasPhoneNumberId && status.hasBusinessId;

    console.log(`📊 [WHATSAPP-CONFIG-CHECK] Status final:`, {
      configured: status.configured,
      errorsCount: status.errors.length
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

async function handleTestConnection(
  apiToken: string | undefined, 
  phoneNumberId: string | undefined, 
  status: WhatsAppConfigStatus
): Promise<Response> {
  if (!apiToken || !phoneNumberId) {
    status.errors.push("Token da API ou ID do número não configurados");
    status.testConnectionStatus = 'failed';
    return createResponse(false, status, "Configuração incompleta");
  }

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
      
      return createResponse(true, status, "Conexão testada com sucesso", { phoneData: data });
    } else {
      const errorData = await testResponse.json();
      status.testConnectionStatus = 'failed';
      status.errors.push(`Erro na API: ${errorData.error?.message || 'Erro desconhecido'}`);
      console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro na API:`, errorData);
      
      return createResponse(false, status, "Falha no teste de conexão", { apiError: errorData });
    }
  } catch (testError: any) {
    status.testConnectionStatus = 'failed';
    status.errors.push(`Erro de conexão: ${testError.message}`);
    console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro de teste:`, testError);
    
    return createResponse(false, status, "Erro durante teste de conexão");
  }
}

async function handleListTemplates(
  apiToken: string | undefined, 
  businessId: string | undefined, 
  status: WhatsAppConfigStatus
): Promise<Response> {
  if (!apiToken || !businessId) {
    status.errors.push("Token da API ou Business ID não configurados");
    return createResponse(false, status, "Configuração incompleta para listar templates");
  }

  try {
    console.log(`📋 [WHATSAPP-CONFIG-CHECK] Listando templates...`);
    
    const templatesResponse = await fetch(
      `https://graph.facebook.com/v18.0/${businessId}/message_templates`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (templatesResponse.ok) {
      const templatesData = await templatesResponse.json();
      status.templates = templatesData.data || [];
      console.log(`✅ [WHATSAPP-CONFIG-CHECK] Templates encontrados:`, status.templates.length);
      
      return createResponse(true, status, "Templates listados com sucesso", { templates: status.templates });
    } else {
      const errorData = await templatesResponse.json();
      status.errors.push(`Erro ao listar templates: ${errorData.error?.message || 'Erro desconhecido'}`);
      console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro ao listar templates:`, errorData);
      
      return createResponse(false, status, "Falha ao listar templates", { apiError: errorData });
    }
  } catch (error: any) {
    status.errors.push(`Erro ao listar templates: ${error.message}`);
    console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro:`, error);
    
    return createResponse(false, status, "Erro durante listagem de templates");
  }
}

async function handleListBusinessAccounts(
  apiToken: string | undefined, 
  status: WhatsAppConfigStatus
): Promise<Response> {
  if (!apiToken) {
    status.errors.push("Token da API não configurado");
    return createResponse(false, status, "Token necessário para listar business accounts");
  }

  try {
    console.log(`🏢 [WHATSAPP-CONFIG-CHECK] Listando business accounts...`);
    
    // Primeiro, obter o user ID
    const meResponse = await fetch('https://graph.facebook.com/v18.0/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!meResponse.ok) {
      const errorData = await meResponse.json();
      status.errors.push(`Erro ao obter user ID: ${errorData.error?.message || 'Erro desconhecido'}`);
      return createResponse(false, status, "Falha ao obter dados do usuário");
    }

    const userData = await meResponse.json();
    
    // Listar business accounts
    const businessResponse = await fetch(
      `https://graph.facebook.com/v18.0/${userData.id}/businesses`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (businessResponse.ok) {
      const businessData = await businessResponse.json();
      status.businessAccounts = businessData.data || [];
      console.log(`✅ [WHATSAPP-CONFIG-CHECK] Business accounts encontrados:`, status.businessAccounts.length);
      
      return createResponse(true, status, "Business accounts listados com sucesso", { 
        businessAccounts: status.businessAccounts,
        currentUser: userData 
      });
    } else {
      const errorData = await businessResponse.json();
      status.errors.push(`Erro ao listar business accounts: ${errorData.error?.message || 'Erro desconhecido'}`);
      console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro ao listar business accounts:`, errorData);
      
      return createResponse(false, status, "Falha ao listar business accounts", { apiError: errorData });
    }
  } catch (error: any) {
    status.errors.push(`Erro ao listar business accounts: ${error.message}`);
    console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro:`, error);
    
    return createResponse(false, status, "Erro durante listagem de business accounts");
  }
}

async function handleTestMessage(
  apiToken: string | undefined, 
  phoneNumberId: string | undefined, 
  body: TestMessageRequest, 
  status: WhatsAppConfigStatus
): Promise<Response> {
  if (!apiToken || !phoneNumberId) {
    status.errors.push("Token da API ou ID do número não configurados");
    return createResponse(false, status, "Configuração incompleta para envio de teste");
  }

  if (!body.phoneNumber) {
    status.errors.push("Número de telefone não fornecido");
    return createResponse(false, status, "Número de telefone obrigatório");
  }

  try {
    console.log(`📱 [WHATSAPP-CONFIG-CHECK] Enviando mensagem de teste para ${body.phoneNumber}...`);
    
    const message = body.message || "🤖 Esta é uma mensagem de teste do sistema Viver de IA. Se você recebeu esta mensagem, a configuração do WhatsApp está funcionando corretamente!";
    
    const messageData = {
      messaging_product: "whatsapp",
      to: body.phoneNumber,
      type: "text",
      text: {
        body: message
      }
    };

    const sendResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      }
    );

    if (sendResponse.ok) {
      const responseData = await sendResponse.json();
      console.log(`✅ [WHATSAPP-CONFIG-CHECK] Mensagem enviada:`, responseData);
      
      return createResponse(true, status, "Mensagem de teste enviada com sucesso", { 
        messageId: responseData.messages?.[0]?.id,
        sentTo: body.phoneNumber,
        messageData: responseData 
      });
    } else {
      const errorData = await sendResponse.json();
      status.errors.push(`Erro ao enviar mensagem: ${errorData.error?.message || 'Erro desconhecido'}`);
      console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro ao enviar mensagem:`, errorData);
      
      return createResponse(false, status, "Falha ao enviar mensagem de teste", { apiError: errorData });
    }
  } catch (error: any) {
    status.errors.push(`Erro ao enviar mensagem: ${error.message}`);
    console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro:`, error);
    
    return createResponse(false, status, "Erro durante envio da mensagem de teste");
  }
}

function createResponse(success: boolean, status: WhatsAppConfigStatus, message: string, data?: any): Response {
  return new Response(
    JSON.stringify({
      success,
      message,
      status,
      data,
      timestamp: new Date().toISOString()
    }),
    {
      status: success ? 200 : 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

console.log("🔍 [WHATSAPP-CONFIG-CHECK] Edge Function carregada com funcionalidades expandidas!");
serve(handler);
