
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppMessageRequest {
  phoneNumber: string;
  messageType: "template" | "text" | "media";
  templateName?: string;
  templateLanguage?: string;
  templateParams?: Record<string, string>;
  textContent?: string;
  mediaUrl?: string;
  userId?: string;
}

serve(async (req: Request) => {
  // Configurar CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Configuração API WhatsApp
    const whatsappApiVersion = "v18.0";
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");

    console.log("Verificando configurações da API WhatsApp");
    console.log(`WHATSAPP_PHONE_NUMBER_ID configurado: ${phoneNumberId ? "Sim" : "Não"}`);
    console.log(`WHATSAPP_ACCESS_TOKEN configurado: ${accessToken ? "Sim" : "Não"}`);

    if (!phoneNumberId || !accessToken) {
      throw new Error("Configuração da API do WhatsApp ausente");
    }

    // Cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Extrair dados da requisição
    let requestData: WhatsAppMessageRequest;
    try {
      requestData = await req.json();
      console.log("Dados da requisição recebidos:", JSON.stringify(requestData, null, 2));
    } catch (parseError) {
      console.error("Erro ao analisar JSON da requisição:", parseError);
      throw new Error("Formato de requisição inválido");
    }
    
    const { 
      phoneNumber, 
      messageType, 
      templateName, 
      templateLanguage = "pt_BR", 
      templateParams, 
      textContent,
      mediaUrl,
      userId 
    } = requestData;

    // Validar requisição
    if (!phoneNumber) {
      throw new Error("Número de telefone é obrigatório");
    }

    // Formatar o número de telefone (remover caracteres não numéricos)
    const formattedPhone = phoneNumber.replace(/\D/g, "");
    console.log(`Número de telefone formatado: ${formattedPhone}`);

    // Preparar payload para a API do WhatsApp
    let messagePayload: any = { messaging_product: "whatsapp" };

    // Configurar conteúdo com base no tipo de mensagem
    if (messageType === "template" && templateName) {
      messagePayload.recipient_type = "individual";
      messagePayload.to = formattedPhone;
      messagePayload.type = "template";
      
      const components = [];
      if (templateParams) {
        const parameters = Object.entries(templateParams).map(([_, value]) => ({
          type: "text",
          text: value
        }));
        
        if (parameters.length > 0) {
          components.push({
            type: "body",
            parameters
          });
        }
      }

      messagePayload.template = {
        name: templateName,
        language: { code: templateLanguage },
        components: components.length > 0 ? components : undefined
      };

    } else if (messageType === "text" && textContent) {
      messagePayload.recipient_type = "individual";
      messagePayload.to = formattedPhone;
      messagePayload.type = "text";
      messagePayload.text = { body: textContent };

    } else if (messageType === "media" && mediaUrl) {
      messagePayload.recipient_type = "individual";
      messagePayload.to = formattedPhone;
      messagePayload.type = "image";
      messagePayload.image = { link: mediaUrl };
      
    } else {
      throw new Error("Configuração de mensagem inválida");
    }

    // Enviar mensagem via API do WhatsApp
    console.log(`Enviando mensagem para: ${formattedPhone}`);
    console.log(`Payload da mensagem: ${JSON.stringify(messagePayload, null, 2)}`);
    
    const whatsappUrl = `https://graph.facebook.com/${whatsappApiVersion}/${phoneNumberId}/messages`;
    console.log(`URL da API: ${whatsappUrl}`);
    
    const response = await fetch(whatsappUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(messagePayload)
    });

    const responseData = await response.json();
    console.log(`Status da resposta: ${response.status} ${response.statusText}`);
    console.log(`Corpo da resposta: ${JSON.stringify(responseData, null, 2)}`);

    // Registrar mensagem no banco de dados se tiver um userId
    if (userId) {
      try {
        await supabaseClient.from("whatsapp_messages").insert({
          user_id: userId,
          phone_number: formattedPhone,
          message_type: messageType,
          message_content: messageType === "template" 
            ? JSON.stringify({ templateName, params: templateParams }) 
            : (textContent || mediaUrl || ""),
          template_name: templateName,
          status: response.ok ? "sent" : "failed",
          error_message: response.ok ? null : JSON.stringify(responseData),
          sent_at: response.ok ? new Date().toISOString() : null
        });
      } catch (dbError) {
        console.error("Erro ao registrar mensagem no banco de dados:", dbError);
      }
    }

    // Verificar resposta da API
    if (!response.ok) {
      throw new Error(`Erro na API do WhatsApp: ${JSON.stringify(responseData)}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Mensagem enviada com sucesso",
        data: responseData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Erro no envio de mensagem WhatsApp:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "Erro ao enviar mensagem WhatsApp" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
