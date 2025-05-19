
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
    const { email, referralToken, referrerName, type, message }: ReferralInvitation = await req.json();
    
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
    
    // Enviar e-mail usando a função do Supabase
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
    
    return new Response(
      JSON.stringify({ success: true, message: "Convite enviado com sucesso" }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
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
