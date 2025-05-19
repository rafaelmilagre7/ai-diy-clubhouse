
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReferralInvitation {
  email: string;
  referralToken: string;
  referrerName: string;
  type: 'club' | 'formacao';
  message?: string;
  whatsappNumber?: string;
  useWhatsapp?: boolean;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com as credenciais de service_role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Extrair dados da requisição
    const { 
      email, 
      referralToken, 
      referrerName, 
      type, 
      message, 
      whatsappNumber, 
      useWhatsapp 
    }: ReferralInvitation = await req.json();
    
    if (!email || !referralToken) {
      return new Response(
        JSON.stringify({ error: "E-mail e token de indicação são obrigatórios" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Gerar URL com o token de indicação
    const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://viverdeia.ai";
    const invitationUrl = `${siteUrl}/register?referral=${referralToken}`;
    
    // Definir o texto com base no tipo de indicação
    const typeText = type === 'club' ? 'Viver de IA Club' : 'Formação Viver de IA';
    
    // Variáveis para controlar sucesso
    let emailSent = false;
    let whatsappSent = false;
    let errors = [];
    
    // Enviar e-mail usando a função do Supabase
    try {
      // Construir o corpo do e-mail
      const emailBody = `
        <h1>Você foi convidado para o ${typeText}!</h1>
        <p>${referrerName || 'Um amigo'} te convidou para conhecer o ${typeText}.</p>
        ${message ? `<p>"${message}"</p>` : ''}
        <p>Clique no link abaixo para se registrar:</p>
        <p><a href="${invitationUrl}" style="background-color: #3445FF; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Aceitar Convite</a></p>
        <p>Ou acesse este link: <a href="${invitationUrl}">${invitationUrl}</a></p>
        <p>Este convite é válido por 30 dias.</p>
      `;
      
      const { error } = await supabaseClient.functions.invoke("send-email", {
        body: {
          to: email,
          subject: `${referrerName || 'Um amigo'} te convidou para o ${typeText}!`,
          html: emailBody
        }
      });
      
      if (error) {
        throw error;
      }
      
      emailSent = true;
    } catch (emailError: any) {
      console.error("Erro ao enviar email de convite:", emailError);
      errors.push({ type: "email", message: emailError.message });
    }
    
    // Se tiver número de WhatsApp e a flag estiver ativada, enviar também por WhatsApp
    if (useWhatsapp && whatsappNumber) {
      try {
        const templateName = "member_invitation";
        
        // Preparar parâmetros para o template do WhatsApp
        const templateParams = {
          param1: "", // Nome do destinatário (não temos esse dado)
          param2: typeText, // Nome do produto
          param3: message || "", // Mensagem personalizada
          param4: invitationUrl // Link de convite
        };
        
        // Enviar usando a função de WhatsApp com template
        const whatsappResponse = await supabaseClient.functions.invoke("send-whatsapp-message", {
          body: {
            phoneNumber: whatsappNumber,
            messageType: "template",
            templateName: templateName,
            templateLanguage: "pt_BR",
            templateParams: templateParams
          }
        });
        
        if (whatsappResponse.error) {
          throw whatsappResponse.error;
        }
        
        whatsappSent = true;
      } catch (whatsappError: any) {
        console.error("Erro ao enviar convite via WhatsApp:", whatsappError);
        errors.push({ type: "whatsapp", message: whatsappError.message });
      }
    }
    
    // Atualizar estatísticas de envio
    try {
      // Buscar o ID da indicação pelo token
      const { data: referralData } = await supabaseClient
        .from('referrals')
        .select('id')
        .eq('token', referralToken)
        .single();
        
      if (referralData?.id) {
        // Atualizar estatísticas de envio usando a função update_invite_send_attempt
        await supabaseClient.functions.invoke("update_invite_send_stats", {
          body: { invite_id: referralData.id }
        });
      }
    } catch (statsError) {
      console.error("Erro ao atualizar estatísticas de envio:", statsError);
      // Não falhar a operação principal se essa parte falhar
    }
    
    // Definir o status conforme os resultados
    let status = 200;
    let responseMessage = "Convite enviado com sucesso";
    let success = emailSent || whatsappSent;
    
    if (!success) {
      status = 500;
      responseMessage = "Não foi possível enviar o convite por nenhum dos canais";
    } else if (errors.length > 0) {
      responseMessage = "Convite enviado parcialmente";
    }
    
    return new Response(
      JSON.stringify({
        success,
        message: responseMessage,
        channels: {
          email: { sent: emailSent },
          whatsapp: { sent: whatsappSent }
        },
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        status, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error: any) {
    console.error("Erro ao enviar convite:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
