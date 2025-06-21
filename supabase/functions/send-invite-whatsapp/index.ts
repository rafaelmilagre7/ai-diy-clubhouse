
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-security-level",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InviteWhatsAppRequest {
  inviteId: string;
  whatsappNumber: string;
  roleId: string;
  token: string;
  userName: string;
  notes?: string;
}

const formatWhatsAppNumber = (number: string): string => {
  // Remove todos os caracteres não numéricos
  const cleanNumber = number.replace(/\D/g, '');
  
  // Se não começa com código do país, adiciona +55 (Brasil)
  if (!cleanNumber.startsWith('55') && cleanNumber.length <= 11) {
    return `55${cleanNumber}`;
  }
  
  return cleanNumber;
};

const handler = async (req: Request): Promise<Response> => {
  console.log(`📱 [SEND-INVITE-WHATSAPP] Nova requisição: ${req.method} - v4.2 URL Corrigida`);
  
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
    const { inviteId, whatsappNumber, roleId, token, userName, notes }: InviteWhatsAppRequest = await req.json();
    
    console.log(`📱 [SEND-INVITE-WHATSAPP] Enviando template para: ${whatsappNumber}, Usuario: ${userName}, Token: ${token}`);

    // Validar configurações necessárias
    const whatsappToken = Deno.env.get("WHATSAPP_API_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    
    if (!whatsappToken) {
      console.error("❌ [SEND-INVITE-WHATSAPP] WHATSAPP_API_TOKEN não configurado");
      throw new Error("WHATSAPP_API_TOKEN não configurado no Supabase");
    }

    if (!phoneNumberId) {
      console.error("❌ [SEND-INVITE-WHATSAPP] WHATSAPP_PHONE_NUMBER_ID não configurado");
      throw new Error("WHATSAPP_PHONE_NUMBER_ID não configurado no Supabase");
    }

    if (!userName || userName.trim() === '') {
      console.error("❌ [SEND-INVITE-WHATSAPP] Nome do usuário é obrigatório para template");
      throw new Error("Nome do usuário é obrigatório para envio via template WhatsApp");
    }

    // Formatar número do WhatsApp
    const formattedNumber = formatWhatsAppNumber(whatsappNumber);
    console.log(`📱 [SEND-INVITE-WHATSAPP] Número formatado: ${formattedNumber}`);

    // URL CORRIGIDA - usando app.viverdeia.ai
    const siteUrl = Deno.env.get("SITE_URL") || "https://app.viverdeia.ai";
    const inviteUrl = `${siteUrl}/convite/${token}`;
    
    console.log(`📱 [SEND-INVITE-WHATSAPP] URL do convite: ${inviteUrl}`);
    
    // Template correto identificado no discovery
    const templateName = "convitevia";
    const templateId = "1413982056507354";
    
    console.log(`📱 [SEND-INVITE-WHATSAPP] Usando template correto: ${templateName} (ID: ${templateId})`);
    console.log(`📱 [SEND-INVITE-WHATSAPP] Variáveis - Nome: ${userName}, Link: ${inviteUrl}`);
    
    // Construir URL da API
    const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    console.log(`📱 [SEND-INVITE-WHATSAPP] URL da API: ${apiUrl}`);
    
    // Estrutura do template conforme aprovado pelo Meta
    const templateMessage = {
      messaging_product: "whatsapp",
      to: formattedNumber,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: "pt_BR"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: userName.trim()
              },
              {
                type: "text", 
                text: inviteUrl
              }
            ]
          }
        ]
      }
    };

    console.log(`📱 [SEND-INVITE-WHATSAPP] Payload do template:`, JSON.stringify(templateMessage, null, 2));
    
    // Enviar mensagem via WhatsApp Business API usando template
    const whatsappResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateMessage)
    });

    const responseText = await whatsappResponse.text();
    console.log(`📱 [SEND-INVITE-WHATSAPP] Resposta raw da API:`, responseText);

    if (!whatsappResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { error: { message: responseText } };
      }
      
      console.error(`❌ [SEND-INVITE-WHATSAPP] Erro da API (${whatsappResponse.status}):`, errorData);
      
      // Mapear erros específicos de template
      let errorMessage = errorData.error?.message || 'Erro desconhecido da API do WhatsApp';
      
      if (errorMessage.includes('Invalid phone number')) {
        errorMessage = `Número de telefone inválido: ${whatsappNumber}`;
      } else if (errorMessage.includes('template')) {
        errorMessage = `Erro no template WhatsApp: ${errorMessage}`;
      } else if (errorMessage.includes('Invalid access token')) {
        errorMessage = 'Token de acesso do WhatsApp inválido ou expirado';
      } else if (errorMessage.includes('parameter')) {
        errorMessage = `Erro nos parâmetros do template: ${errorMessage}`;
      }
      
      throw new Error(`WhatsApp Template Error: ${errorMessage}`);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error(`❌ [SEND-INVITE-WHATSAPP] Erro ao parsear resposta:`, e);
      throw new Error('Resposta inválida da API do WhatsApp');
    }

    const messageId = responseData.messages?.[0]?.id;
    console.log(`✅ [SEND-INVITE-WHATSAPP] Template enviado com sucesso. ID: ${messageId}, Template: ${templateName}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Template de convite WhatsApp enviado com sucesso",
        messageId: messageId,
        whatsappNumber: formattedNumber,
        inviteId,
        templateUsed: templateName,
        templateId: templateId,
        userName: userName,
        inviteUrl: inviteUrl, // Incluir URL para verificação
        apiResponse: responseData
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [SEND-INVITE-WHATSAPP] Erro:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor",
        message: "Falha ao enviar template de convite WhatsApp",
        details: error.stack ? error.stack.split('\n').slice(0, 3) : undefined
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("📱 [SEND-INVITE-WHATSAPP] Edge Function carregada com URL corrigida! v4.2");
serve(handler);
