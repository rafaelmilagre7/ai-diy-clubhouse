
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-function-timeout",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface TestEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`📧 [TEST-EMAIL-${requestId}] Nova requisição: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`🔄 [TEST-EMAIL-${requestId}] CORS Preflight - respondendo`);
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  if (req.method !== "POST") {
    console.log(`❌ [TEST-EMAIL-${requestId}] Método não permitido: ${req.method}`);
    return new Response(
      JSON.stringify({ error: "Método não permitido" }), 
      { 
        status: 405, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  const startTime = Date.now();

  try {
    console.log(`📨 [TEST-EMAIL-${requestId}] Processando requisição POST...`);
    
    const { email }: TestEmailRequest = await req.json();
    
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email inválido" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`🔑 [TEST-EMAIL-${requestId}] Verificando configurações...`);
    
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error(`❌ [TEST-EMAIL-${requestId}] API key não configurada`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "RESEND_API_KEY não configurada nos secrets"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`✅ [TEST-EMAIL-${requestId}] API key encontrada, enviando email...`);

    const resend = new Resend(apiKey);
    
    const emailResponse = await resend.emails.send({
      from: "Sistema Viver de IA <sistema@viverdeia.ai>",
      to: [email],
      subject: "🔧 Teste de Diagnóstico - Sistema Corrigido",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">✅ Sistema de Email Operacional</h1>
          <p>Este é um email de teste para verificar se o sistema de envio está funcionando corretamente.</p>
          
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0; color: #374151;">📊 Detalhes do Teste:</h3>
            <ul style="margin: 8px 0;">
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
              <li><strong>Request ID:</strong> ${requestId}</li>
              <li><strong>Sistema:</strong> Resend API</li>
              <li><strong>Status:</strong> Funcionando corretamente</li>
            </ul>
          </div>

          <p>Se você recebeu este email, significa que:</p>
          <ul>
            <li>✅ A API key do Resend está configurada corretamente</li>
            <li>✅ O domínio viverdeia.ai está validado</li>
            <li>✅ A Edge Function está operacional</li>
            <li>✅ O sistema de convites deve funcionar normalmente</li>
          </ul>

          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Este é um email automático de teste do sistema Viver de IA.<br>
            Não é necessário responder a este email.
          </p>
        </div>
      `,
    });

    const responseTime = Date.now() - startTime;
    console.log(`✅ [TEST-EMAIL-${requestId}] Email enviado com sucesso:`, {
      emailId: emailResponse.data?.id,
      responseTime
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de teste enviado com sucesso",
        emailId: emailResponse.data?.id,
        responseTime,
        requestId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [TEST-EMAIL-${requestId}] Erro crítico:`, {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      type: error.constructor.name
    });
    
    const responseTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor",
        responseTime,
        requestId
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("📧 [TEST-EMAIL] Edge Function carregada e pronta!");
serve(handler);
