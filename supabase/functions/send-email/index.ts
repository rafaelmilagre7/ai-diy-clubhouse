
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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
    const body: EmailRequest = await req.json();

    if (!body.to || !body.subject || !body.html) {
      throw new Error("Campos obrigatórios faltando: to, subject, html");
    }

    const { to, subject, html, text, from = "Viver de IA <noreply@viverdeia.ai>", cc, bcc, reply_to } = body;

    console.log(`Enviando email para: ${to}`);
    console.log(`Assunto: ${subject}`);

    // Configurar cliente SMTP usando as variáveis de ambiente do Supabase
    const client = new SmtpClient();
    await client.connectTLS({
      hostname: Deno.env.get("SMTP_HOST") || "",
      port: Number(Deno.env.get("SMTP_PORT")) || 587,
      username: Deno.env.get("SMTP_USER") || "",
      password: Deno.env.get("SMTP_PASS") || "",
    });

    // Preparar destinatários CC e BCC
    const ccAddresses = cc?.join(", ");
    const bccAddresses = bcc?.join(", ");

    // Enviar email usando o cliente SMTP
    const sendResult = await client.send({
      from: from,
      to: to,
      cc: ccAddresses,
      bcc: bccAddresses,
      replyTo: reply_to,
      subject: subject,
      content: html,
      html: html,
    });

    await client.close();

    console.log("Email enviado com sucesso:", sendResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email enviado com sucesso",
        data: sendResult
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
