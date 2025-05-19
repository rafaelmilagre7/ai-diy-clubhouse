
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  reply_to?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");
    const body: EmailRequest = await req.json();

    if (!body.to || !body.subject || !body.html) {
      throw new Error("Campos obrigatórios faltando: to, subject, html");
    }

    const { to, subject, html, text, from = "Viver de IA <noreply@viverdeia.ai>", cc, bcc, reply_to } = body;

    console.log(`Enviando email para: ${to}`);
    console.log(`Assunto: ${subject}`);

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      cc,
      bcc,
      reply_to,
    });

    if (error) {
      console.error("Erro ao enviar email:", error);
      throw error;
    }

    console.log("Email enviado com sucesso:", data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email enviado com sucesso",
        data 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erro no envio de email:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "Erro ao processar solicitação de email" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
