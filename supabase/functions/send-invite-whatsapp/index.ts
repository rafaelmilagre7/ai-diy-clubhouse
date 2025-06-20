
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
  console.log(`📱 [SEND-INVITE-WHATSAPP] Nova requisição: ${req.method}`);
  
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

    const whatsappToken = Deno.env.get("WHATSAPP_API_TOKEN");
    if (!whatsappToken) {
      throw new Error("WHATSAPP_API_TOKEN não configurado");
    }

    // Formatar número do WhatsApp
    const formattedNumber = formatWhatsAppNumber(whatsappNumber);
    console.log(`📱 [SEND-INVITE-WHATSAPP] Número formatado: ${formattedNumber}`);

    // Preparar mensagem
    const message = getWhatsAppMessage(token, isResend, notes);
    
    // Enviar mensagem via WhatsApp Business API
    const whatsappResponse = await fetch(`https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages`, {
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

    if (!whatsappResponse.ok) {
      const errorData = await whatsappResponse.json();
      console.error(`❌ [SEND-INVITE-WHATSAPP] Erro da API:`, errorData);
      throw new Error(`WhatsApp API Error: ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const responseData = await whatsappResponse.json();
    console.log(`✅ [SEND-INVITE-WHATSAPP] Mensagem enviada:`, responseData.messages?.[0]?.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Mensagem de convite enviada por WhatsApp com sucesso",
        messageId: responseData.messages?.[0]?.id,
        whatsappNumber: formattedNumber,
        inviteId
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
        message: "Falha ao enviar mensagem de convite por WhatsApp"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("📱 [SEND-INVITE-WHATSAPP] Edge Function carregada!");
serve(handler);
