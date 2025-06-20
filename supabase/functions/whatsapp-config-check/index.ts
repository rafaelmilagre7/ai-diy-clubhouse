
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ConfigCheckRequest {
  action: 'check_config' | 'get_business_profile' | 'list_templates' | 'send_test_message';
  phone?: string;
  message?: string;
}

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
    const { action, phone, message }: ConfigCheckRequest = await req.json();
    console.log(`🔧 [WHATSAPP-CONFIG-CHECK] Ação: ${action}`);

    // Verificar variáveis de ambiente
    const whatsappToken = Deno.env.get("WHATSAPP_API_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const businessId = Deno.env.get("WHATSAPP_BUSINESS_ID");
    const webhookToken = Deno.env.get("WHATSAPP_WEBHOOK_TOKEN");

    const configStatus = {
      hasToken: !!whatsappToken,
      hasPhoneId: !!phoneNumberId,
      hasBusinessId: !!businessId,
      hasWebhookToken: !!webhookToken,
      isConfigured: !!(whatsappToken && phoneNumberId && businessId && webhookToken)
    };

    console.log(`🔧 [WHATSAPP-CONFIG-CHECK] Status da configuração:`, configStatus);

    if (action === 'check_config') {
      let phoneNumber, businessName;

      // Se tiver configuração básica, tentar obter informações do negócio
      if (configStatus.hasToken && configStatus.hasPhoneId) {
        try {
          const profileResponse = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}?fields=display_phone_number,verified_name`,
            {
              headers: {
                'Authorization': `Bearer ${whatsappToken}`,
              }
            }
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            phoneNumber = profileData.display_phone_number;
            businessName = profileData.verified_name;
            console.log(`✅ [WHATSAPP-CONFIG-CHECK] Perfil obtido:`, { phoneNumber, businessName });
          }
        } catch (error) {
          console.warn(`⚠️ [WHATSAPP-CONFIG-CHECK] Não foi possível obter perfil:`, error);
        }
      }

      return new Response(
        JSON.stringify({
          ...configStatus,
          phoneNumber,
          businessName
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Para outras ações, verificar se está configurado
    if (!configStatus.isConfigured) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "WhatsApp não está completamente configurado",
          configStatus
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Obter perfil do negócio
    if (action === 'get_business_profile') {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${phoneNumberId}?fields=display_phone_number,verified_name,status,quality_rating`,
          {
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
            }
          }
        );

        const responseText = await response.text();
        console.log(`🔧 [WHATSAPP-CONFIG-CHECK] Resposta do perfil:`, responseText);

        if (!response.ok) {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error?.message || 'Erro ao obter perfil');
        }

        const data = JSON.parse(responseText);
        return new Response(
          JSON.stringify({
            success: true,
            data,
            message: "Perfil do negócio obtido com sucesso"
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );

      } catch (error: any) {
        console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro ao obter perfil:`, error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message || "Erro ao obter perfil do negócio"
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Listar templates
    if (action === 'list_templates') {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${businessId}/message_templates?fields=name,status,language,category`,
          {
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
            }
          }
        );

        const responseText = await response.text();
        console.log(`🔧 [WHATSAPP-CONFIG-CHECK] Resposta dos templates:`, responseText);

        if (!response.ok) {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error?.message || 'Erro ao listar templates');
        }

        const data = JSON.parse(responseText);
        return new Response(
          JSON.stringify({
            success: true,
            data,
            message: `${data.data?.length || 0} templates encontrados`
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );

      } catch (error: any) {
        console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro ao listar templates:`, error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message || "Erro ao listar templates"
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Enviar mensagem de teste
    if (action === 'send_test_message') {
      if (!phone || !message) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Número de telefone e mensagem são obrigatórios"
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      try {
        // Formatar número (remover caracteres especiais e garantir formato internacional)
        const cleanPhone = phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

        console.log(`🔧 [WHATSAPP-CONFIG-CHECK] Enviando teste para: ${formattedPhone}`);

        const response = await fetch(
          `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: formattedPhone,
              type: "text",
              text: {
                body: `🧪 TESTE DE CONECTIVIDADE\n\n${message}\n\n✅ WhatsApp Business API está funcionando!\n\nViver de IA - ${new Date().toLocaleString('pt-BR')}`
              }
            })
          }
        );

        const responseText = await response.text();
        console.log(`🔧 [WHATSAPP-CONFIG-CHECK] Resposta do envio:`, responseText);

        if (!response.ok) {
          const errorData = JSON.parse(responseText);
          let errorMessage = errorData.error?.message || 'Erro desconhecido';
          
          if (errorMessage.includes('Invalid phone number')) {
            errorMessage = `Número de telefone inválido: ${phone}`;
          } else if (errorMessage.includes('Unsupported request')) {
            errorMessage = 'Configuração da API do WhatsApp inválida';
          } else if (errorMessage.includes('Invalid access token')) {
            errorMessage = 'Token de acesso do WhatsApp inválido ou expirado';
          }
          
          throw new Error(errorMessage);
        }

        const data = JSON.parse(responseText);
        const messageId = data.messages?.[0]?.id;

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              messageId,
              phone: formattedPhone,
              originalPhone: phone
            },
            message: "Mensagem de teste enviada com sucesso"
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );

      } catch (error: any) {
        console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro ao enviar teste:`, error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message || "Erro ao enviar mensagem de teste"
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Ação não reconhecida"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [WHATSAPP-CONFIG-CHECK] Erro crítico:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor"
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
