
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-function-timeout",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InviteEmailRequest {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  token?: string;
  requestId?: string;
  forceResend?: boolean;
  test?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`📧 [INVITE-EMAIL-${requestId}] Nova requisição: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`🔄 [INVITE-EMAIL-${requestId}] CORS Preflight - respondendo`);
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  if (req.method !== "POST") {
    console.log(`❌ [INVITE-EMAIL-${requestId}] Método não permitido: ${req.method}`);
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
    console.log(`📨 [INVITE-EMAIL-${requestId}] Processando requisição POST...`);
    
    const body: InviteEmailRequest = await req.json();
    console.log(`📝 [INVITE-EMAIL-${requestId}] Dados recebidos:`, {
      email: body.email,
      hasInviteUrl: !!body.inviteUrl,
      roleName: body.roleName,
      test: body.test
    });

    // Handle test requests
    if (body.test) {
      console.log(`🧪 [INVITE-EMAIL-${requestId}] Requisição de teste detectada`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email e URL do convite são obrigatórios" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { email, inviteUrl, roleName, expiresAt, senderName, notes } = body;
    
    if (!email || !inviteUrl) {
      console.log(`❌ [INVITE-EMAIL-${requestId}] Dados obrigatórios ausentes`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email e URL do convite são obrigatórios" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`🔑 [INVITE-EMAIL-${requestId}] Verificando configurações...`);
    
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error(`❌ [INVITE-EMAIL-${requestId}] API key não configurada`);
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

    console.log(`✅ [INVITE-EMAIL-${requestId}] API key encontrada, enviando email...`);

    const resend = new Resend(apiKey);
    
    const emailResponse = await resend.emails.send({
      from: "Viver de IA <sistema@viverdeia.ai>",
      to: [email],
      subject: `🎯 Convite para ${roleName} - Viver de IA`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>🎯 Você foi convidado!</h1>
            <p style="font-size: 18px; margin: 10px 0;">Junte-se à nossa plataforma de IA</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
            <p>Olá!</p>
            <p>Você recebeu um convite para se cadastrar na plataforma <strong>Viver de IA</strong> como <strong>${roleName}</strong>.</p>
            
            ${notes ? `
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="margin: 0; color: #374151;">📝 Mensagem do convite:</h3>
              <p style="margin: 8px 0; color: #6b7280;">${notes}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        display: inline-block;
                        font-size: 16px;">
                🚀 Aceitar Convite
              </a>
            </div>

            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; color: #92400e;">
                ⏰ <strong>Importante:</strong> Este convite expira em ${new Date(expiresAt).toLocaleDateString('pt-BR')} às ${new Date(expiresAt).toLocaleTimeString('pt-BR')}.
              </p>
            </div>

            <p>Se você não conseguir clicar no botão, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background: #f9f9f9; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${inviteUrl}
            </p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
            <p>Este convite foi enviado por ${senderName || 'Administrador'}<br>
            Se você não esperava este convite, pode ignorar este email.</p>
            <p>© 2024 Viver de IA - Plataforma de Inteligência Artificial</p>
          </div>
        </div>
      `,
    });

    const responseTime = Date.now() - startTime;
    console.log(`✅ [INVITE-EMAIL-${requestId}] Email enviado com sucesso:`, {
      emailId: emailResponse.data?.id,
      responseTime
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Convite enviado com sucesso",
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
    console.error(`❌ [INVITE-EMAIL-${requestId}] Erro crítico:`, {
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

console.log("📧 [INVITE-EMAIL] Edge Function carregada e pronta!");
serve(handler);
