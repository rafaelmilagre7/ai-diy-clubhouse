
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

    const emailSubject = `🚀 Convite para Viver de IA - ${roleName}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Convite para Viver de IA</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
          .token-box { background: #f8f9fa; border: 2px dashed #667eea; padding: 15px; margin: 20px 0; text-align: center; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Você foi convidado para Viver de IA!</h1>
          </div>
          
          <div class="content">
            <p>Olá!</p>
            
            <p><strong>${senderName}</strong> convidou você para acessar a plataforma <strong>Viver de IA</strong> com o papel de <strong>${roleName}</strong>.</p>
            
            ${notes ? `<div style="background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; border-radius: 4px;"><strong>📝 Observações:</strong><br>${notes}</div>` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" class="button">
                🚀 ACEITAR CONVITE
              </a>
            </div>
            
            <p><strong>⏰ Este convite expira em: ${expirationDate}</strong></p>
            
            <div class="token-box">
              <p><strong>🔑 Link do convite:</strong></p>
              <p style="word-break: break-all; font-family: monospace; color: #667eea; font-weight: bold;">
                ${inviteUrl}
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Se você não conseguir clicar no botão, copie e cole o link acima no seu navegador.
            </p>
          </div>
          
          <div class="footer">
            <p>Este é um email automático do sistema Viver de IA.</p>
            <p>Se você não esperava este convite, pode ignorar este email com segurança.</p>
            <p>© 2024 Viver de IA - Plataforma de Inteligência Artificial</p>
          </div>
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
          from: "Viver de IA <convites@viverdeia.ai>",
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
