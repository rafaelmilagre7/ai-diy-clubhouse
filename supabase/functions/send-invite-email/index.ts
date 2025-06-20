
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
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
  forceResend?: boolean;
  requestId?: string;
  token?: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`📧 [SEND-EMAIL-${requestId}] Nova requisição: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`🔄 [SEND-EMAIL-${requestId}] CORS Preflight - respondendo`);
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  if (req.method !== "POST") {
    console.log(`❌ [SEND-EMAIL-${requestId}] Método não permitido: ${req.method}`);
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
    console.log(`🔄 [SEND-EMAIL-${requestId}] Processando envio de convite...`);
    
    const {
      email,
      inviteUrl,
      roleName,
      expiresAt,
      senderName = 'Administrador',
      notes,
      inviteId,
      forceResend = false,
      requestId: clientRequestId,
      token
    }: InviteEmailRequest = await req.json();

    const finalRequestId = clientRequestId || requestId;
    
    console.log(`📋 [SEND-EMAIL-${finalRequestId}] Dados recebidos:`, {
      email,
      roleName,
      senderName,
      inviteId,
      forceResend,
      hasToken: !!token,
      tokenLength: token?.length,
      inviteUrlLength: inviteUrl?.length
    });

    // Validação básica
    if (!email || !email.includes('@')) {
      console.error(`❌ [SEND-EMAIL-${finalRequestId}] Email inválido:`, email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email inválido",
          message: "Endereço de email não é válido" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!inviteUrl || !inviteUrl.includes('/accept-invite/')) {
      console.error(`❌ [SEND-EMAIL-${finalRequestId}] URL de convite inválida:`, inviteUrl);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "URL de convite inválida",
          message: "Link do convite não está no formato correto" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verificar API key do Resend
    if (!Deno.env.get("RESEND_API_KEY")) {
      console.error(`❌ [SEND-EMAIL-${finalRequestId}] RESEND_API_KEY não configurada`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Configuração de email não encontrada",
          message: "Serviço de email não está configurado" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Preparar dados do email
    const expirationDate = new Date(expiresAt).toLocaleDateString('pt-BR');
    const emailSubject = `Convite para acessar a plataforma - ${roleName}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Convite para a Plataforma</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Você foi convidado!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 18px; margin-bottom: 20px;">
              Olá! <strong>${senderName}</strong> convidou você para fazer parte da nossa plataforma.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px;">
                <strong>Papel:</strong> ${roleName}<br>
                <strong>Email:</strong> ${email}<br>
                <strong>Expira em:</strong> ${expirationDate}
              </p>
              ${notes ? `<p style="margin: 15px 0 0 0; font-style: italic; color: #666;">"${notes}"</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                🚀 Aceitar Convite
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Se o botão não funcionar, copie e cole este link no seu navegador:<br>
              <a href="${inviteUrl}" style="color: #667eea; word-break: break-all;">${inviteUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              Este convite expira em ${expirationDate}. Se você não solicitou este convite, pode ignorar este email.
            </p>
          </div>
        </body>
      </html>
    `;

    console.log(`📧 [SEND-EMAIL-${finalRequestId}] Enviando email via Resend...`);

    // Enviar email via Resend
    const emailResult = await resend.emails.send({
      from: "Plataforma <onboarding@resend.dev>",
      to: [email],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(`📧 [SEND-EMAIL-${finalRequestId}] Resposta do Resend:`, emailResult);

    if (emailResult.error) {
      console.error(`❌ [SEND-EMAIL-${finalRequestId}] Erro do Resend:`, emailResult.error);
      throw new Error(`Resend Error: ${emailResult.error.message || JSON.stringify(emailResult.error)}`);
    }

    if (!emailResult.data?.id) {
      console.error(`❌ [SEND-EMAIL-${finalRequestId}] Resposta inválida do Resend:`, emailResult);
      throw new Error('Resend não retornou ID do email');
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ [SEND-EMAIL-${finalRequestId}] Email enviado com sucesso! ID: ${emailResult.data.id}, Tempo: ${responseTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email enviado com sucesso",
        emailId: emailResult.data.id,
        strategy: "resend",
        method: "direct",
        responseTime,
        requestId: finalRequestId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [SEND-EMAIL-${requestId}] Erro crítico:`, {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      type: error.constructor.name
    });
    
    const responseTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor",
        message: "Falha ao enviar email de convite",
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

console.log("📧 [SEND-EMAIL] Edge Function carregada e pronta para envio de convites!");
serve(handler);
