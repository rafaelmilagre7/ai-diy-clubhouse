
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  
  try {
    console.log(`🔥 [EDGE-${requestId}] === SEND INVITE EMAIL INICIADO ===`);
    
    const requestBody: InviteEmailRequest = await req.json();
    console.log(`📨 [EDGE-${requestId}] Request recebido:`, {
      email: requestBody.email,
      inviteUrl: requestBody.inviteUrl?.substring(0, 50) + '...',
      roleName: requestBody.roleName,
      senderName: requestBody.senderName,
      requestId: requestBody.requestId,
      token: requestBody.token?.substring(0, 8) + '...'
    });

    const {
      email,
      inviteUrl,
      roleName,
      expiresAt,
      senderName = 'Administrador',
      notes,
      inviteId,
      forceResend = false,
      token
    } = requestBody;

    // Validações básicas
    if (!email || !inviteUrl) {
      console.error(`❌ [EDGE-${requestId}] Dados obrigatórios faltando`);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email e URL do convite são obrigatórios',
          error: 'missing_required_fields'
        }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Verificar se RESEND_API_KEY existe
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error(`❌ [EDGE-${requestId}] RESEND_API_KEY não configurada`);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Serviço de email não configurado',
          error: 'missing_api_key'
        }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log(`📧 [EDGE-${requestId}] Inicializando Resend...`);
    const resend = new Resend(resendApiKey);

    // Preparar conteúdo do email
    const expirationDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailSubject = `Convite para acessar a plataforma - ${roleName}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Convite para a Plataforma</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Você foi convidado!</h1>
          
          <p>Olá!</p>
          
          <p><strong>${senderName}</strong> convidou você para acessar nossa plataforma com o papel de <strong>${roleName}</strong>.</p>
          
          ${notes ? `<p><em>Observações: ${notes}</em></p>` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              ACEITAR CONVITE
            </a>
          </div>
          
          <p><strong>⏰ Este convite expira em: ${expirationDate}</strong></p>
          
          <p>Se você não conseguir clicar no botão, copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">
            ${inviteUrl}
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            Este é um email automático do sistema de convites. Se você não esperava este convite, pode ignorar este email.
          </p>
        </div>
      </body>
      </html>
    `;

    console.log(`📮 [EDGE-${requestId}] Enviando email via Resend...`);
    
    // Enviar email com retry
    let emailResponse;
    let lastError;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📤 [EDGE-${requestId}] Tentativa ${attempt}/3...`);
        
        emailResponse = await resend.emails.send({
          from: "Sistema de Convites <noreply@resend.dev>",
          to: [email],
          subject: emailSubject,
          html: emailHtml
        });

        if (emailResponse.id) {
          console.log(`✅ [EDGE-${requestId}] Email enviado com sucesso! ID:`, emailResponse.id);
          break;
        }
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ [EDGE-${requestId}] Tentativa ${attempt} falhou:`, error);
        
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    if (!emailResponse?.id) {
      console.error(`💥 [EDGE-${requestId}] Todas as tentativas falharam:`, lastError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Falha no envio após múltiplas tentativas',
          error: lastError?.message || 'unknown_error',
          strategy: 'resend',
          method: 'email'
        }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log(`🎉 [EDGE-${requestId}] === SUCESSO COMPLETO ===`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email enviado com sucesso',
        emailId: emailResponse.id,
        strategy: 'resend',
        method: 'email'
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error(`💥 [EDGE-${requestId}] ERRO CRÍTICO:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message,
        strategy: 'resend',
        method: 'email'
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
};

serve(handler);
