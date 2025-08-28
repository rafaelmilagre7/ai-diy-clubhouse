import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestRequest {
  testPhone: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 [WHATSAPP-TEST] Iniciando teste de entrega...');
    
    const { testPhone, message = 'Teste de entrega WhatsApp - Viver de IA' }: TestRequest = await req.json();
    
    if (!testPhone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Número de teste obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obter credenciais do WhatsApp
    const whatsappToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_BUSINESS_PHONE_ID');
    
    if (!whatsappToken || !phoneNumberId) {
      console.error('❌ [WHATSAPP-TEST] Credenciais não configuradas');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Credenciais WhatsApp não configuradas',
          details: {
            hasToken: !!whatsappToken,
            hasPhoneId: !!phoneNumberId
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Formatar número
    const cleanPhone = testPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    console.log(`📱 [WHATSAPP-TEST] Enviando para: ${formattedPhone.substring(0, 4)}***`);
    
    // Preparar dados do template
    const templateData = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "convitevia",
        language: {
          code: "pt_BR"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: "Sistema de Teste"
              },
              {
                type: "text", 
                text: "https://app.viverdeia.ai"
              }
            ]
          }
        ]
      }
    };

    console.log('📱 [WHATSAPP-TEST] Dados do template:', JSON.stringify(templateData, null, 2));

    // Enviar mensagem via API do WhatsApp
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      }
    );

    const responseData = await whatsappResponse.json();
    
    console.log('📱 [WHATSAPP-TEST] Resposta da API:', {
      status: whatsappResponse.status,
      statusText: whatsappResponse.statusText,
      data: responseData
    });

    if (!whatsappResponse.ok) {
      console.error('❌ [WHATSAPP-TEST] Erro da API:', responseData);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erro na API do WhatsApp',
          details: responseData
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sucesso
    const messageId = responseData.messages?.[0]?.id;
    console.log(`✅ [WHATSAPP-TEST] Mensagem enviada! ID: ${messageId}`);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: messageId,
        phoneNumber: formattedPhone,
        timestamp: new Date().toISOString(),
        response: responseData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ [WHATSAPP-TEST] Erro inesperado:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);