
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InviteWhatsAppRequest {
  inviteId: string;
  whatsappNumber: string;
  roleId: string;
  token: string;
  isResend?: boolean;
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

const getWhatsAppMessage = (token: string, isResend: boolean = false, notes?: string) => {
  const inviteUrl = `${Deno.env.get("SITE_URL") || "https://viverdeia.ai"}/convite/${token}`;
  
  let message = isResend 
    ? `🔄 *Reenvio do Convite - Viver de IA*\n\n` 
    : `🎉 *Convite para Viver de IA*\n\n`;
    
  message += isResend
    ? `Você recebeu novamente seu convite para fazer parte da comunidade *Viver de IA* - a plataforma de educação e networking em Inteligência Artificial.\n\n`
    : `Você foi convidado para fazer parte da comunidade *Viver de IA* - a plataforma de educação e networking em Inteligência Artificial mais completa do Brasil!\n\n`;
    
  message += `✨ *Aceite seu convite clicando no link:*\n${inviteUrl}\n\n`;
  
  message += `🔑 *Código do convite:* \`${token}\`\n\n`;
  
  if (notes) {
    message += `📝 *Observações:*\n${notes}\n\n`;
  }
  
  message += `Este convite é pessoal e intransferível. Se você não solicitou este convite, pode ignorar esta mensagem.\n\n`;
  message += `© 2024 Viver de IA - Transformando negócios com IA`;
  
  return message;
};

const handler = async (req: Request): Promise<Response> => {
  console.log(`📱 [SEND-INVITE-WHATSAPP] Nova requisição: ${req.method} - v2.0 deployed`);
  
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
    const { inviteId, whatsappNumber, roleId, token, isResend = false, notes }: InviteWhatsAppRequest = await req.json();
    
    console.log(`📱 [SEND-INVITE-WHATSAPP] Enviando para: ${whatsappNumber}, Token: ${token}, Reenvio: ${isResend}`);

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

    // Formatar número do WhatsApp
    const formattedNumber = formatWhatsAppNumber(whatsappNumber);
    console.log(`📱 [SEND-INVITE-WHATSAPP] Número formatado: ${formattedNumber}`);

    // Preparar mensagem
    const message = getWhatsAppMessage(token, isResend, notes);
    
    // Construir URL da API
    const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    console.log(`📱 [SEND-INVITE-WHATSAPP] URL da API: ${apiUrl}`);
    
    // Enviar mensagem via WhatsApp Business API
    const whatsappResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedNumber,
        type: "text",
        text: {
          body: message
        }
      })
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
      
      // Mapear erros comuns para mensagens mais amigáveis
      let errorMessage = errorData.error?.message || 'Erro desconhecido da API do WhatsApp';
      
      if (errorMessage.includes('Invalid phone number')) {
        errorMessage = `Número de telefone inválido: ${whatsappNumber}`;
      } else if (errorMessage.includes('Unsupported request')) {
        errorMessage = 'Configuração da API do WhatsApp inválida';
      } else if (errorMessage.includes('Invalid access token')) {
        errorMessage = 'Token de acesso do WhatsApp inválido ou expirado';
      }
      
      throw new Error(`WhatsApp API Error: ${errorMessage}`);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error(`❌ [SEND-INVITE-WHATSAPP] Erro ao parsear resposta:`, e);
      throw new Error('Resposta inválida da API do WhatsApp');
    }

    const messageId = responseData.messages?.[0]?.id;
    console.log(`✅ [SEND-INVITE-WHATSAPP] Mensagem enviada com sucesso. ID: ${messageId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Mensagem de convite enviada por WhatsApp com sucesso",
        messageId: messageId,
        whatsappNumber: formattedNumber,
        inviteId,
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
        message: "Falha ao enviar mensagem de convite por WhatsApp",
        details: error.stack ? error.stack.split('\n').slice(0, 3) : undefined
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("📱 [SEND-INVITE-WHATSAPP] Edge Function carregada com melhorias! v2.0 deployed");
serve(handler);
